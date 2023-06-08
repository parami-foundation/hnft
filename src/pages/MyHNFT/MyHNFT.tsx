import React, { useEffect } from 'react';
import { Spin, Button, notification } from 'antd';
import { useAccount, useConnect, useNetwork, useSwitchNetwork } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { Hnft } from '../Hnft';
import { useHNFT } from '../../hooks';
import { MintHNFT } from '../MintHNFT';
import './MyHNFT.scss';

export function MyHNFT() {
  const hnft = useHNFT();
  const { status } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const { connect, connectors } = useConnect({
    connector: new InjectedConnector(),
  });

  useEffect(() => {
    if (status === 'connected' && chain?.id !== 5) {
      notification.info({
        message: 'Unsupported network',
        description: 'Please switch to the test network goerli',
      });
      switchNetwork?.(5);
    }
  }, [chain, status]);

  return (
    <div className='my-nfts'>
      {status !== 'connected' && (
        <div className='connect-wallet'>
          <div>Own your own hNFT and claim your rewards</div>
          {status === 'disconnected' && (
            <Button onClick={() => connect({ connector: connectors[0] })}>
              Connect Wallet
            </Button>
          )}
          {status === 'connecting' && <Button loading>Connecting</Button>}
        </div>
      )}

      {status === 'connected' && chain?.id === 5 && (
        <div className='my-nfts-container'>
          <Spin spinning={!hnft} className='loading-container'>
            {hnft?.tokenId ? <Hnft config={hnft} /> : <MintHNFT />}
          </Spin>
        </div>
      )}
    </div>
  );
}
