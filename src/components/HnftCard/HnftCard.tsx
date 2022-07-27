import { Avatar, Card, Modal, notification, Spin, Tooltip, Typography, Upload, UploadProps } from 'antd';
import { ethers } from 'ethers';
import { useMetaMask } from 'metamask-react';
import React, { useCallback, useEffect, useState } from 'react';
import { NFT } from '../../models/wnft';
import ERC721WContract from '../../ERC721WContract.json';
import { LinkOutlined, TwitterCircleFilled, LogoutOutlined, UploadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { RingPFP } from '../RingPFP';
import { HNFTCollectionContractAddress } from '../../models/contract';
import './HnftCard.scss';
import { ChangeLinkModal } from '../ChangeLinkModal';

const { Paragraph } = Typography;

export interface HnftCardProps {
    hnft: NFT,
    unwrapped: () => void
}

const tabList = [
    {
        key: 'pfp',
        tab: 'PFP Generator',
    },
    {
        key: 'link',
        tab: 'Link Manager',
    },
];

export function HnftCard({ hnft, unwrapped }: HnftCardProps) {
    const contractAddress = hnft.asset_contract.address;
    const tokenId = +hnft.token_id;

    const { ethereum, account, chainId } = useMetaMask();
    const [hnftContract, setHnftContract] = useState<ethers.Contract>();
    const [currentLink, setCurrentLink] = useState<string>();
    const [coverImageUrl, setCoverImageUrl] = useState<string>();
    const [changeLinkModal, setChangeLinkModal] = useState<boolean>(false);

    const canUnwrap = contractAddress !== HNFTCollectionContractAddress[parseInt(chainId ?? '1', 16) as 1 | 4];

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
        if (hnftContract) {
            try {
                const link = (await hnftContract.getSlotUri(tokenId, account)).toString();
                setCurrentLink(link || 'https://app.parami.io');
            } catch (e) {
                setCurrentLink('https://app.parami.io');
                console.error('Get Current Link Error', JSON.stringify(e));
            }
        }
    }, [tokenId, account, hnftContract]);

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

    const actions = [
        <Tooltip title="Update Twitter Profile">
            <TwitterCircleFilled className='actionIcon' onClick={() => console.log('Update Twitter Profile')} />
        </Tooltip>,
        <Tooltip title="Upload New Image">
            <Upload {...props}>
                <UploadOutlined className='actionIcon' />
            </Upload>
        </Tooltip>,
        <Tooltip title="Update Link">
            <LinkOutlined className='actionIcon' onClick={() => setChangeLinkModal(true)} />
        </Tooltip>
    ];

    if (canUnwrap) {
        actions.push(<Tooltip title="Unwrap">
            <LogoutOutlined className='actionIcon' onClick={() => showUnwrapConfirm()} />
        </Tooltip>);
    }

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

    return (<>
        <Card
            className='hnftCard'
            style={{ width: 400, display: 'inline-block' }}
            cover={
                <div style={{ height: 400 }}>
                    <RingPFP tokenId={tokenId} address={contractAddress} imgUrl={coverImageUrl ?? hnft.image_url} fallbackImageUrl={hnft.image_url}></RingPFP>
                </div>
            }
            actions={actions}
        >
            <Card.Meta
                avatar={<Avatar size="large" shape='square' src={hnft.image_url} />}
                title={hnft.name}
                description={<>
                    <Paragraph ellipsis={{ rows: 1, expandable: false, symbol: 'more' }}>{hnft.description ?? ''}</Paragraph>
                    {currentLink && <p><a href={currentLink} target="_blank">{currentLink}</a></p>}
                    {!currentLink && <Spin></Spin>}
                </>}
            />
        </Card>

        {changeLinkModal && !!hnftContract &&
            <ChangeLinkModal hContract={hnftContract} tokenId={tokenId}
                onCancel={() => setChangeLinkModal(false)}
                linkChanged={() => { updateCurrentLink(); setChangeLinkModal(false); }}
            />}
    </>);
};
