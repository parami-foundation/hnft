import { Button, message, notification, Upload, Modal, Image as AntdImage } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import type { RcFile, UploadProps } from 'antd/es/upload/interface';
import { CloudUploadOutlined } from '@ant-design/icons';
import { useMetaMask } from 'metamask-react';
import { ethers } from 'ethers';
import { HNFTCollectionContractAddress, ParamiLinkContractAddress } from '../../models/contract';
import ERC721HCollection from '../../ERC721HCollection.json';
import { IPFS_ENDPOINT, IPFS_UPLOAD } from '../../models/wnft';
import './Hnft.scss';

const { Dragger } = Upload;

export interface HnftProps {
    onCancel: () => void,
    onCreate: () => void
}

const tokenUriMock = 'https://ipfs.parami.io/ipfs/' + 'QmR76hWfwgdKnbH4jLsaqw9jpfD6ESCSHL8rw36tTchExc';

export function Hnft({ onCancel, onCreate }: HnftProps) {
    const [loading, setLoading] = useState<boolean>(false);
    const { ethereum, chainId } = useMetaMask();
    const [createHnftLoading, setCreateHnftLoading] = useState<boolean>(false);
    const [hnftContract, setHnftContract] = useState<ethers.Contract>();
    const [imageUri, setImageUri] = useState<string>();

    const chain_id = parseInt(chainId ?? '1', 16);

    useEffect(() => {
        if (ethereum && (chain_id === 1 || chain_id === 4)) {
            setHnftContract(new ethers.Contract(
                HNFTCollectionContractAddress[chain_id],
                ERC721HCollection.abi,
                new ethers.providers.Web3Provider(ethereum).getSigner()
            ));
        }
    }, [ethereum, chain_id]);

    const createHnft = useCallback(async (imageUri: string) => {
        if (hnftContract && (chain_id === 1 || chain_id === 4)) {
            try {
                notification.info({
                    message: 'Creating HNFT',
                    description: 'Please confirm in your wallet'
                })
                const resp = await hnftContract.mintAndAuthorizeTo(imageUri, ParamiLinkContractAddress[chain_id]);
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

    }, [hnftContract, chain_id]);

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
                setImageUri(tokenUriMock);
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
