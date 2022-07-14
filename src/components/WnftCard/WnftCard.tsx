import { ethers } from 'ethers';
import React, { useState } from 'react';
import { Card, Tooltip, Tag, Button, Avatar } from 'antd';
import { PfpGenerator } from '../PfpGenerator';
import { LinkManager } from '../LinkManager';
import { CloseOutlined } from '@ant-design/icons';
import './WnftCard.scss';
import { WNFT } from '../../models/wnft';

export interface WnftCardProps {
    wnft: WNFT;
    onRemove: () => void;
}

export function WnftCard({ wnft, onRemove }: WnftCardProps) {
    const { contractInfo, nft } = wnft;
    const { contractAddress: address, tokenId, contract } = contractInfo;

    const [activeTabKey, setActiveTabKey] = useState<string>('pfp');

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

    return (<div className='wnft-card'>
        <Card
            title={<Card.Meta
                avatar={<Avatar shape="square" size={120} src={nft.image_url} />}
                title={nft.name}
                description={nft.description}
            ></Card.Meta>}
            extra={<Button shape="circle" danger onClick={() => onRemove()} icon={<CloseOutlined />}></Button>}
            tabList={tabList}
            activeTabKey={activeTabKey}
            onTabChange={key => setActiveTabKey(key)}
        >
            {activeTabKey === 'pfp' && <PfpGenerator imgUrl={nft.image_url} address={address} tokenId={tokenId}></PfpGenerator>}

            {activeTabKey === 'link' && <LinkManager tokenId={tokenId} contract={contract}></LinkManager>}
        </Card>
    </div>);
};
