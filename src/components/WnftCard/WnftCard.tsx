import { ethers } from 'ethers';
import React, { useState } from 'react';
import { Card, Tooltip, Tag, Button } from 'antd';
import { PfpGenerator } from '../PfpGenerator';
import { LinkManager } from '../LinkManager';
import { CloseOutlined } from '@ant-design/icons';
import './WnftCard.scss';

export interface WnftCardProps {
    address: string;
    tokenId: number;
    contract: ethers.Contract;
    onRemove: () => void;
}

export function WnftCard({ address, tokenId, contract, onRemove }: WnftCardProps) {
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

    const contentList: Record<string, React.ReactNode> = {
        pfp: <p>pfp tab</p>,
        link: <p>link tab</p>,
    };

    return (<div className='wnft-card'>
        <Card
            title={<>
                <Tooltip title={address}>
                    <span>WNFT {`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}</span>
                </Tooltip>
                <Tag style={{ marginLeft: '10px' }}>TokenId {tokenId}</Tag>
            </>}
            extra={<Button shape="circle" danger onClick={() => onRemove()} icon={<CloseOutlined />}></Button>}
            tabList={tabList}
            activeTabKey={activeTabKey}
            onTabChange={key => setActiveTabKey(key)}
        >
            {activeTabKey === 'pfp' && <PfpGenerator address={address} tokenId={tokenId}></PfpGenerator>}

            {activeTabKey === 'link' && <LinkManager tokenId={tokenId} contract={contract}></LinkManager>}
        </Card>
    </div>);
};
