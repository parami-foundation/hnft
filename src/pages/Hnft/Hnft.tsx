import { Button, Form, message, notification, Upload, Modal, Spin } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import type { UploadChangeParam } from 'antd/es/upload';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { useMetaMask } from 'metamask-react';
import { ethers } from 'ethers';
import { HNFTCollectionContractAddress, ParamiLinkContractAddress } from '../../models/contract';
import ERC721HCollection from '../../ERC721HCollection.json';

export interface HnftProps {
    onCancel: () => void,
    onCreate: () => void
}

const tokenUriMock = 'https://ipfs.parami.io/ipfs/' + 'QmR76hWfwgdKnbH4jLsaqw9jpfD6ESCSHL8rw36tTchExc';

export function Hnft({ onCancel, onCreate }: HnftProps) {
    const [imageUrl, setImageUrl] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);
    const { ethereum, chainId } = useMetaMask();
    const [createHnftLoading, setCreateHnftLoading] = useState<boolean>(false);
    const [hnftContract, setHnftContract] = useState<ethers.Contract>();

    const chain_id = parseInt(chainId ?? '1', 16);

    const getBase64 = (img: RcFile, callback: (url: string) => void) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result as string));
        reader.readAsDataURL(img);
    };

    const beforeUpload = (file: RcFile) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            notification.error({
                message: 'You can only upload JPG/PNG file!'
            });
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            notification.error({
                message: 'Image must smaller than 2MB!'
            });
        }
        return isJpgOrPng && isLt2M;
    };

    const onFinish = (value: any) => { // todo: type this
        // const { name, symbol, fileUpload } = value;
        // const ipfsHash = fileUpload.file.response.Hash;
        // const tokenUri = config.ipfs.endpoint + ipfsHash;
        // console.log(name, symbol, tokenUri);

        console.log('form submit', value);
        setCreateHnftLoading(true);
        createHnft(tokenUriMock);
    }

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

    const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
        console.log('[kai] handle Change, info.file:', info?.file);
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            console.log('[kai] Upload file done. response:', info.file?.response)
            // Get this url from response in real world.
            getBase64(info.file.originFileObj as RcFile, url => {
                setLoading(false);
                setImageUrl(url);
            });
            return;
        }
        if (info.file.status === 'error') {
            message.error('Upload Image Error')
            setLoading(false);
        }
    };

    const uploadButton = (
        <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    const [form] = Form.useForm();

    return (<>
        <Modal title='Create HNFT' centered visible onCancel={onCancel}
            footer={[
                <Button key="back" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" loading={createHnftLoading} onClick={() => form.submit()}>
                    Create
                </Button>
            ]}
        >
            <p>Upload your image to create HNFT</p>
            <Form
                form={form}
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                onFinish={onFinish}
                autoComplete="off"
            >
                <Form.Item
                    label="NFT Image"
                    name="fileUpload"
                // rules={[{ required: true, message: 'Please upload your NFT image!' }]}
                // using mock...
                >
                    <Upload
                        name="avatar"
                        listType="picture-card"
                        className="avatar-uploader"
                        showUploadList={false}
                        action="https://ipfs.parami.io/api/v0/add?stream-channels=true"
                        beforeUpload={beforeUpload}
                        onChange={handleChange}
                    >
                        {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
                    </Upload>
                </Form.Item>
            </Form>
        </Modal>
    </>);
};
