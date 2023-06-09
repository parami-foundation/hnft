import { createAvatar } from '@dicebear/core';
import * as lorelei from '@dicebear/lorelei';
import { isMobile } from 'react-device-detect';
import { useWeb3Modal } from '@web3modal/react';
import { Layout, Button, Avatar, Tooltip } from 'antd';
import { useAccount, useConnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import './NavBar.scss';

const { Header } = Layout;

export function NavBar() {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { connect, connectors, isLoading } = useConnect({
    connector: new InjectedConnector(),
  });

  function createAvatorUri(seed: string): string {
    return createAvatar(lorelei, {
      seed,
    }).toDataUriSync();
  }

  const walletConnect = () => {
    if (isMobile) {
      open();
    } else {
      connect({ connector: connectors[0] });
    }
  };

  return (
    <Header className='nav-bar'>
      <div className='logo'>
        <img src='/images/logo-text.svg' alt='' />
      </div>

      <div className='user'>
        {!isConnected && (
          <Button onClick={walletConnect} loading={isLoading}>
            {isLoading ? 'Connecting' : 'Connect Wallet'}
          </Button>
        )}

        {isConnected && address && (
          <Tooltip
            title={`${address.substring(0, 8)}...${address.substring(
              address.length - 6
            )}`}
            color='#ff5b00'
            placement='bottomLeft'
          >
            <Avatar
              className='avatar'
              shape='square'
              size={36}
              src={createAvatorUri(address)}
            />
          </Tooltip>
        )}
      </div>
    </Header>
  );
}
