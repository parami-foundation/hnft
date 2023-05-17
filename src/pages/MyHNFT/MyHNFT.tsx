import React, { useMemo } from 'react';
import { Card, Spin, message } from 'antd';
import { Link } from 'react-router-dom';
import { useCustomMetaMask } from '../../hooks/useCustomMetaMask';
import { Hnft } from '../Hnft';
import { useHNFT } from '../../hooks/useHNFT';
import { MintHNFT } from '../MintHNFT';
import './MyHNFT.scss';

export function MyHNFT() {
  const { status } = useCustomMetaMask();
  const { hnft, loading } = useHNFT();

  const renderNFTContent = useMemo(() => {
    if (status === 'notConnected') {
      message.warn('Connect Wallet');
      return;
    }
    if (loading) {
      return <Spin spinning={loading} className='loading-container' />;
    }

    if (hnft) {
      return <Hnft config={hnft} />;
    }

    return <MintHNFT />;
  }, [loading, hnft, status]);

  return (
    <div className='my-nfts'>
      <div className='my-nfts-container'>{renderNFTContent}</div>
      <Card style={{ marginTop: '40px' }} title='Parami Extension Download'>
        <Link to='/files/Parami-Extension-v0.0.3.zip' target='_blank' download>
          Click to download Parami Extension
        </Link>
      </Card>
    </div>
  );
}
