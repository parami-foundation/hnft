import React, { useEffect } from 'react';
import { Spin, Button, notification } from 'antd';
import { useMetaMask } from 'metamask-react';
import { useCustomMetaMask } from '../../hooks/useCustomMetaMask';
import { Hnft } from '../Hnft';
import { useHNFT } from '../../hooks';
import { MintHNFT } from '../MintHNFT';
import './MyHNFT.scss';

export function MyHNFT() {
  const { status, connect, chainId } = useCustomMetaMask();
  const { hnft, loading } = useHNFT();
  const metamask = useMetaMask();

  useEffect(() => {
    if (status === 'connected' && chainId !== 5) {
      notification.info({
        message: 'Unsupported network',
        description: 'Please switch to the test network goerli',
      });

      metamask.switchChain('0x5');
    }
  }, [chainId, status]);

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

      {status === 'connected' && chainId === 5 && (
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
