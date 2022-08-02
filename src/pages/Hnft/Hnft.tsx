import { Button, message, notification, Upload, Modal, Image as AntdImage } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import type { RcFile, UploadProps } from 'antd/es/upload/interface';
import { CloudUploadOutlined } from '@ant-design/icons';
import { ethers } from 'ethers';
import { HNFTCollectionContractAddress, ParamiLinkContractAddress } from '../../models/contract';
import ERC721HCollection from '../../ERC721HCollection.json';
import { IPFS_ENDPOINT, IPFS_UPLOAD } from '../../models/wnft';
import './Hnft.scss';
import { useCustomMetaMask } from '../../hooks/useCustomMetaMask';

const { Dragger } = Upload;

export interface HnftProps {
    onCancel: () => void,
    onCreate: () => void
}

export function Hnft({ onCancel, onCreate }: HnftProps) {
    const [loading, setLoading] = useState<boolean>(false);
    const { ethereum, chainId } = useCustomMetaMask();
    const [createHnftLoading, setCreateHnftLoading] = useState<boolean>(false);
    const [hnftContract, setHnftContract] = useState<ethers.Contract>();
    const [imageUri, setImageUri] = useState<string>();

    useEffect(() => {
        if (ethereum && (chainId === 1 || chainId === 4)) {
            setHnftContract(new ethers.Contract(
                HNFTCollectionContractAddress[chainId],
                ERC721HCollection.abi,
                new ethers.providers.Web3Provider(ethereum).getSigner()
            ));
        }
    }, [ethereum, chainId]);

    const createHnft = useCallback(async (imageUri: string) => {
        if (hnftContract && (chainId === 1 || chainId === 4)) {
            try {
                setCreateHnftLoading(true);
                notification.info({
                    message: 'Creating HNFT',
                    description: 'Please confirm in your wallet'
                })
                const resp = await hnftContract.mintAndAuthorizeTo(imageUri, ParamiLinkContractAddress[chainId]);
                await resp.wait();
                notification.success({
                    message: 'Create HNFT Success'
                });
                setCreateHnftLoading(false);
                onCreate();
            } catch (e) {
                notification.error({
                    message: 'Create HNFT Error',
                    description: JSON.stringify(e)
                });
                setCreateHnftLoading(false);
            }
        }

    }, [hnftContract, chainId]);

    const props: UploadProps = {
        name: 'file',
        multiple: false,
        action: IPFS_UPLOAD,
        onChange(info) {
            if (info.file.status === 'uploading') {
                setLoading(true);
                return;
            }
            if (info.file.status === 'done') {
                const ipfsHash = info.file.response.Hash;
                setImageUri(IPFS_ENDPOINT + ipfsHash);
                return;
            }
            if (info.file.status === 'error') {
                message.error('Upload Image Error');
                setLoading(false);
            }
        },
        beforeUpload(file: RcFile) {
            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isJpgOrPng) {
                notification.error({
                    message: 'You can only upload JPG/PNG file!'
                });
            }
            const isLt4M = file.size / 1024 / 1024 < 4;
            if (!isLt4M) {
                notification.error({
                    message: 'Image must smaller than 4MB!'
                });
            }
            return isJpgOrPng && isLt4M;
        },
        showUploadList: false,
        disabled: loading || !!imageUri
    };

    return (<>
        <Modal title='Create HNFT' centered visible onCancel={onCancel}
            footer={[
                <Button key="back" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" disabled={!imageUri} loading={createHnftLoading} onClick={() => createHnft(imageUri!)}>
                    Create
                </Button>
            ]}
        >
            <Dragger {...props} className='upload-dragger'>
                {imageUri && (
                    <AntdImage width={200} preview={false} src={imageUri}></AntdImage>
                )}
                {!imageUri && (<>
                    <p className="ant-upload-drag-icon">
                        <CloudUploadOutlined className='upload-icon' />
                    </p>
                    <p className="ant-upload-text">Upload Image to Create HNFT</p>
                    <p className="ant-upload-hint">
                        Click or drag file to this area to upload
                    </p>
                </>)}
            </Dragger>
        </Modal>
    </>);
};
