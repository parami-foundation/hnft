import React, { useEffect } from 'react';
import { Spin, Button, notification } from 'antd';
import { useWeb3Modal } from '@web3modal/react';
import { useAccount, useConnect, useNetwork, useSwitchNetwork } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { isMobile } from 'react-device-detect';
import { Hnft } from '../Hnft';
import { useHNFT } from '../../hooks';
import { MintHNFT } from '../MintHNFT';
import './MyHNFT.scss';

export function MyHNFT() {
  const hnft = useHNFT();
  const { isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { open } = useWeb3Modal();

  const { connect, connectors, isLoading } = useConnect({
    connector: new InjectedConnector(),
  });

  useEffect(() => {
    if (isConnected && chain?.id !== 5) {
      notification.info({
        message: 'Unsupported network',
        description: 'Please switch to the test network goerli',
      });
      switchNetwork?.(5);
    }
  }, [chain]);

  const walletConnect = () => {
    if (isMobile) {
      open()
    } else {
      connect({ connector: connectors[0] });
    }
  }

  return (
    <div className='my-nfts'>
      {!isConnected && (
        <div className='connect-wallet'>
          <div>Own your own hNFT and claim your rewards</div>
          <Button onClick={walletConnect} loading={isLoading}>
            {isLoading ? 'Connecting' : 'Connect Wallet'}
          </Button>
        </div>
      )}

      {isConnected && chain?.id === 5 && (
        <div className='my-nfts-container'>
          <Spin spinning={!hnft} className='loading-container'>
            {hnft?.tokenId ? <Hnft config={hnft} /> : <MintHNFT />}
          </Spin>
        </div>
      )}
    </div>
  );
}
