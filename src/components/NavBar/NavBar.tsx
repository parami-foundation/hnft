import './NavBar.scss';
import { createAvatar } from '@dicebear/avatars';
import * as style from '@dicebear/avatars-identicon-sprites';
import { Layout, Button, Avatar, Tooltip } from 'antd';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

const { Header } = Layout;

export function NavBar() {
  const { address, isConnected, status } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });

  function createAvatorUri(seed: string): string {
    return createAvatar(style, {
      seed,
      dataUri: true,
    });
  }

  console.log(status, '---status---');

  return (
    <Header className='nav-bar'>
      <div className='logo'>
        <img src='/images/logo-text.svg' alt='' />
      </div>

      <div className='user'>
        {status === 'disconnected' && (
          <Button onClick={() => connect()}>Connect Wallet</Button>
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
