import { useMetaMask } from 'metamask-react';
import React, { useState } from 'react';
import { Form, Card, Spin, List, Avatar, Typography } from 'antd';
import './Wnft.scss';
import { CreateWnftModal } from '../../components/CreateWnftModal';
import { Collection, NFT, WNFT, WnftData } from '../../models/wnft';
import { WnftCard } from '../../components/WnftCard';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useOpenseaApi } from '../../hooks/useOpenseaApi';
import { ImportNftModal } from '../../components/ImportNftModal';

const { Paragraph } = Typography;

export interface WnftProps { }

export function Wnft({ }: WnftProps) {
    const [wnft, setWnft] = useState<WNFT>();
    const [manualImport, setManualImport] = useState<boolean>(false);

    const [collections, setCollections] = useState<Collection[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<Collection>();
    const [nfts, setNfts] = useState<NFT[]>([]);
    const [selectedNft, setSelectedNft] = useState<NFT>();

    const { status, ethereum, chainId, account } = useMetaMask();
    const { retrieveCollections, retrieveNFTs, retrieveAsset } = useOpenseaApi();

    useEffect(() => {
        if (ethereum && chainId && account) {
            retrieveCollections().then(collections => setCollections(collections));
        }
    }, [ethereum, chainId, account])

    useEffect(() => {
        setSelectedCollection(undefined);
    }, [collections]);

    useEffect(() => {
        setNfts([]);
        setWnft(undefined);
        if (selectedCollection) {
            retrieveNFTs(selectedCollection.slug).then(nfts => setNfts(nfts?.assets ?? []));
        }
    }, [selectedCollection]);

    const onAddWnftData = (wnft: WnftData) => {
        retrieveAsset(wnft.contractAddress, wnft.tokenId).then(nft => {
            setWnft({
                contractInfo: wnft,
                nft
            });
        });
    }

    return (<div className='wnft'>
        <Card bordered={false} title="Your NFT Collections">
            {status === 'notConnected' && <p>Connect wallet and start managing your WNFTs!</p>}

            {collections.length > 0 && (
                <List
                    itemLayout="vertical"
                    size="large"
                    grid={{ gutter: 16, column: 3 }}
                    pagination={{
                        onChange: page => {
                            console.log(page);
                        },
                        pageSize: 6,
                    }}
                    footer={
                        <div>
                            Couldn't find your NFT? <a href='javascript:void(0)' onClick={() => setManualImport(true)}>Import NFT manually</a>
                        </div>
                    }
                    dataSource={collections}
                    renderItem={item => (
                        <List.Item
                            key={item.slug}
                        >
                            <Card hoverable onClick={() => setSelectedCollection(item)}>
                                <Card.Meta
                                    avatar={<Avatar size="large" shape="square" src={item.image_url} />}
                                    title={item.name}
                                    description={<Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>{item.description ?? ''}</Paragraph>}
                                />
                            </Card>
                        </List.Item>
                    )}
                />
            )}
        </Card>

        {selectedCollection && (
            <Card bordered={false} title={selectedCollection.name}>
                {nfts.length === 0 && (
                    <div style={{ width: '100%', textAlign: 'center' }}>
                        <Spin />
                    </div>
                )}
                {nfts.length > 0 && (
                    <List
                        itemLayout="vertical"
                        size="large"
                        grid={{ gutter: 16, column: 4 }}
                        pagination={{
                            onChange: page => {
                                console.log(page);
                            },
                            pageSize: 8,
                        }}
                        dataSource={nfts}
                        renderItem={item => (
                            <List.Item
                                key={item.token_id}
                            >
                                <Card hoverable onClick={() => setSelectedNft(item)} cover={<img src={item.image_url} />}>
                                    <Card.Meta
                                        title={item.name}
                                        description={<Paragraph ellipsis={{ rows: 4, expandable: true, symbol: 'more' }}>{item.description ?? ''}</Paragraph>}
                                    />
                                </Card>
                            </List.Item>
                        )}
                    />
                )}
            </Card>
        )}

        {manualImport && (
            <Form.Provider
                onFormFinish={(_name, { values }) => {
                    retrieveAsset(values.address, +values.tokenId).then(nft => {
                        setSelectedNft(nft);
                        setManualImport(false);
                    });
                }}
            >
                <ImportNftModal onCancel={() => setManualImport(false)} />
            </Form.Provider>
        )}

        {selectedNft && (
            <CreateWnftModal
                nft={selectedNft}
                onCancel={() => setSelectedNft(undefined)}
                onSubmit={onAddWnftData}
            ></CreateWnftModal>
        )}

        {wnft && (
            <WnftCard wnft={wnft}
                onRemove={() => setWnft(undefined)}
            ></WnftCard>
        )}

        <Card bordered={false} style={{ marginTop: '20px' }} title="Parami Extension Download">
            <Link to="/files/parami-extension.zip" target="_blank" download>Click to download Parami Extension</Link>
        </Card>
    </div>);
};
