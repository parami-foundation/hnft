import React from 'react';
import { Spin, Button } from 'antd';
import { useCustomMetaMask } from '../../hooks/useCustomMetaMask';
import { Hnft } from '../Hnft';
import { useHNFT } from '../../hooks/useHNFT';
import { MintHNFT } from '../MintHNFT';
import './MyHNFT.scss';

export function MyHNFT() {
  const { status, connect } = useCustomMetaMask();
  const { hnft, loading } = useHNFT();

  return (
    <div className='my-nfts'>
      {status !== 'connected' && (
        <div className='connect-wallet'>
          <div>Own your own hNFT and claim your rewards</div>
          {status === 'notConnected' && (
            <Button onClick={() => connect()}>Connect Wallet</Button>
          )}
          {status === 'connecting' && <Button loading>Connecting</Button>}
        </div>
      )}

      {status === 'connected' && (
        <div className='my-nfts-container'>
          <Spin spinning={loading} className='loading-container'>
            {!loading && (
              <>
                {hnft && <Hnft config={hnft} />}
                {!hnft && <MintHNFT />}
              </>
            )}
          </Spin>
        </div>
      )}
    </div>
  );
}
