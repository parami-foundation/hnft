import React, { useCallback, useState } from 'react';
import { Form, Card, Spin, List, Avatar, Typography, Modal } from 'antd';
import './Wnft.scss';
import { CreateWnftModal } from '../../components/CreateWnftModal';
import { Collection, NFT, WNFT, WnftData } from '../../models/wnft';
import { useEffect } from 'react';
import { useOpenseaApi } from '../../hooks/useOpenseaApi';
import { ImportNftModal } from '../../components/ImportNftModal';
import { HNFTCollectionContractAddress } from '../../models/contract';
import { useCustomMetaMask } from '../../hooks/useCustomMetaMask';
import { useWContractAddresses } from '../../hooks/useWContractAddresses';

const { Paragraph, Title } = Typography;

export interface WnftProps {
    onCancel: () => void,
    onCreateWNFT: (wnft: NFT) => void
}

export function Wnft({ onCancel, onCreateWNFT }: WnftProps) {
    const [manualImport, setManualImport] = useState<boolean>(false);

    const [collections, setCollections] = useState<Collection[]>();
    const [selectedCollection, setSelectedCollection] = useState<Collection>();
    const [nfts, setNfts] = useState<NFT[]>([]);
    const [selectedNft, setSelectedNft] = useState<NFT>();

    const { chainId } = useCustomMetaMask();
    const { retrieveCollections, retrieveNFTs, retrieveAsset } = useOpenseaApi();
    const wAddresses = useWContractAddresses();

    useEffect(() => {
        if (retrieveCollections && chainId && wAddresses) {
            retrieveCollections().then(collections => {
                const nftCollections = (collections ?? []).filter(collection => {
                    return !collection.primary_asset_contracts?.find(contract => {
                        return [HNFTCollectionContractAddress[chainId as 1 | 5], ...wAddresses].find(wAddr => wAddr === contract.address)
                    })
                });
                setCollections(nftCollections);
            });
        }
    }, [retrieveCollections, chainId, wAddresses]);

    useEffect(() => {
        setSelectedCollection(undefined);
    }, [collections]);

    useEffect(() => {
        setNfts([]);
        if (selectedCollection && retrieveNFTs) {
            retrieveNFTs({ collectionSlug: selectedCollection.slug }).then(nfts => setNfts(nfts));
        }
    }, [selectedCollection, retrieveNFTs]);

    const onAddWnftData = useCallback((wnft: WnftData) => {
        if (retrieveAsset) {
            retrieveAsset(wnft.contractAddress, wnft.tokenId).then(nft => {
                onCreateWNFT(nft);
            });
        }
    }, [retrieveAsset])

    return (
        <Modal open centered width={1000} onCancel={onCancel} title="Wrap NFT">
            <div className='wnft'>
                {!collections && (
                    <div className='loading-container'>
                        <Spin tip="Loading..." />
                    </div>
                )}
                {collections && collections.length === 0 && (
                    <p>Could not find any NFTs. Please try create HNFT directly.</p>
                )}
                {collections && collections.length > 0 && (<>
                    <Title level={5}>Select Collection</Title>
                    <List
                        itemLayout="vertical"
                        size="large"
                        grid={{ column: 2 }}
                        pagination={{
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
                                <Card hoverable className={`collection-card ${selectedCollection?.slug === item.slug ? 'selected' : ''}`} onClick={() => setSelectedCollection(item)} bodyStyle={{ padding: '14px' }}>
                                    <Card.Meta
                                        avatar={<Avatar size="large" shape="square" src={item.image_url} />}
                                        title={item.name}
                                        description={<Paragraph style={{ margin: 0 }} ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>{item.description ?? ''}</Paragraph>}
                                    />
                                </Card>
                            </List.Item>
                        )}
                    />
                </>)}


                {selectedCollection && (<>
                    <Title level={5}>{selectedCollection.name}</Title>
                    {nfts.length === 0 && (
                        <div style={{ width: '100%', textAlign: 'center' }}>
                            <Spin />
                        </div>
                    )}
                    {nfts.length > 0 && (
                        <List
                            itemLayout="vertical"
                            size="large"
                            grid={{ column: 3 }}
                            pagination={{
                                pageSize: 3,
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
                </>)}

                {manualImport && (
                    <Form.Provider
                        onFormFinish={(_name: any, { values }: any) => {
                            if (retrieveAsset) {
                                retrieveAsset(values.address, +values.tokenId).then(nft => {
                                    setSelectedNft(nft);
                                    setManualImport(false);
                                });
                            }
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
            </div>
        </Modal>);
};
