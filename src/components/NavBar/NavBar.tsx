import { createAvatar } from '@dicebear/core';
import * as lorelei from '@dicebear/lorelei';
import { Layout, Button, Avatar, Tooltip } from 'antd';
import { useAccount, useConnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import './NavBar.scss';

const { Header } = Layout;

export function NavBar() {
  const { address, status } = useAccount();
  const { connect, connectors } = useConnect({
    connector: new InjectedConnector(),
  });

  function createAvatorUri(seed: string): string {
    return createAvatar(lorelei, {
      seed,
    }).toDataUriSync();;
  }

  return (
    <Header className='nav-bar'>
      <div className='logo'>
        <img src='/images/logo-text.svg' alt='' />
      </div>

      <div className='user'>
        {status === 'disconnected' && (
          <Button onClick={() => connect({ connector: connectors[0] })}>
            Connect Wallet
          </Button>
        )}

        {status === 'connecting' && <Button loading>Connecting</Button>}

        {status === 'connected' && address && (
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
