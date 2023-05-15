import { Avatar, Button, Card, Col, Dropdown, Menu, Modal, notification, Row, Spin, Typography, Upload, UploadProps } from 'antd';
import { ethers } from 'ethers';
import React, { useCallback, useEffect, useState } from 'react';
import { NFT } from '../../models/wnft';
import ERC721WContract from '../../ERC721WContract.json';
import { TwitterCircleFilled, LogoutOutlined, UploadOutlined, ExclamationCircleOutlined, FormOutlined, EllipsisOutlined } from '@ant-design/icons';
import { RingPFP } from '../RingPFP';
import { HNFTCollectionContractAddress, ParamiLinkContractAddress } from '../../models/contract';
import './HnftCard.scss';
import { ChangeLinkModal } from '../ChangeLinkModal';
import { useCustomMetaMask } from '../../hooks/useCustomMetaMask';
import ImgCrop from 'antd-img-crop';

const { Paragraph, Title } = Typography;

export interface HnftCardProps {
    hnft: NFT,
    unwrapped: () => void
}

export function HnftCard({ hnft, unwrapped }: HnftCardProps) {
    const contractAddress = hnft.asset_contract.address;
    const tokenId = +hnft.token_id;

    const { ethereum, account, chainId } = useCustomMetaMask();
    const [hnftContract, setHnftContract] = useState<ethers.Contract>();
    const [currentLink, setCurrentLink] = useState<string>();
    const [coverImageUrl, setCoverImageUrl] = useState<string>();
    const [changeLinkModal, setChangeLinkModal] = useState<boolean>(false);

    const canUnwrap = (chainId === 1 || chainId === 5) && contractAddress !== HNFTCollectionContractAddress[chainId];

    useEffect(() => {
        if (ethereum) {
            setHnftContract(new ethers.Contract(
                contractAddress,
                ERC721WContract.abi,
                new ethers.providers.Web3Provider(ethereum).getSigner()
            ));
        }
    }, [ethereum]);

    const updateCurrentLink = useCallback(async () => {
        if (hnftContract && chainId) {
            try {
                const link = (await hnftContract.getSlotUri(tokenId, ParamiLinkContractAddress[chainId as 1 | 4])).toString();
                setCurrentLink(link || 'https://app.parami.io');
            } catch (e) {
                setCurrentLink('https://app.parami.io');
                console.error('Get Current Link Error', JSON.stringify(e));
            }
        }
    }, [tokenId, account, hnftContract, chainId]);

    useEffect(() => {
        if (hnftContract) {
            updateCurrentLink();
        }
    }, [hnftContract])

    const props: UploadProps = {
        beforeUpload: file => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setCoverImageUrl(reader.result as string);
            }
            return false;
        },
        fileList: []
    };

    const showUnwrapConfirm = () => {
        if (hnftContract) {
            Modal.confirm({
                title: 'Do you want to unwrap this NFT?',
                icon: <ExclamationCircleOutlined />,
                content: 'After unwrap, the hyperlink will stop working.',
                onOk() {
                    notification.info({
                        message: 'Unwrapping NFT',
                        description: 'Please confirm in your wallet...'
                    });
                    return hnftContract.unwrap(tokenId).then(() => {
                        notification.success({
                            message: 'Unwrap NFT success'
                        });
                        unwrapped();
                    }).catch((e: any) => {
                        notification.error({
                            message: 'Unwrap NFT failed',
                            description: JSON.stringify(e)
                        })
                    });
                },
                onCancel() { },
            });
        }
    };

    const dropdownMenuItems = [
        {
            key: 'upload',
            label: (
                <ImgCrop quality={1}>
                    <Upload {...props}>
                        Use different image
                    </Upload>
                </ImgCrop>
            ),
            icon: <UploadOutlined />
        }
    ];

    if (canUnwrap) {
        dropdownMenuItems.push(
            {
                key: 'unwrap',
                label: (
                    <a onClick={() => showUnwrapConfirm()}>
                        Unwrap
                    </a>
                ),
                icon: <LogoutOutlined />
            }
        );
    }

    return (<>
        <Card
            className='hnftCard'
        >
            <div className='pfp-container'>
                <RingPFP tokenId={tokenId} address={contractAddress} imgUrl={coverImageUrl ?? hnft.image_url} fallbackImageUrl={hnft.image_url}></RingPFP>
            </div>

            <div className='nft-info'>
                <Row>
                    <Col span={4}>
                        <Avatar size="large" shape='square' src={hnft.image_url} />
                    </Col>
                    <Col span={20}>
                        <Title level={5}>
                            {hnft.name}
                            <Dropdown overlay={<Menu items={dropdownMenuItems} />}>
                                <Button className='action-button float-right' shape='circle' icon={<EllipsisOutlined />}></Button>
                            </Dropdown>
                        </Title>
                        <Paragraph ellipsis={{ rows: 2, expandable: false, symbol: 'more' }}>{hnft.description ?? ''}</Paragraph>
                        <div className='link-container'>
                            {currentLink && <>
                                <a href={currentLink} target="_blank">{currentLink}</a>
                                <Button className='action-button' shape='circle' onClick={() => setChangeLinkModal(true)} icon={<FormOutlined />}></Button>
                            </>}
                            {!currentLink && <Spin></Spin>}
                        </div>
                    </Col>
                </Row>
            </div>

            <div className='menu'>
                <Button disabled>
                    <TwitterCircleFilled />Set Twitter Profile Image
                </Button>
            </div>
        </Card>

        {changeLinkModal && !!hnftContract &&
            <ChangeLinkModal hContract={hnftContract} tokenId={tokenId}
                onCancel={() => setChangeLinkModal(false)}
                linkChanged={() => { updateCurrentLink(); setChangeLinkModal(false); }}
            />}
    </>);
};
