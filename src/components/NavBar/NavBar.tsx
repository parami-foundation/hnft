import './NavBar.scss';
import { createAvatar } from '@dicebear/avatars';
import * as style from '@dicebear/avatars-identicon-sprites';
import { Layout, Button, Avatar, Tooltip } from 'antd';
import { useCustomMetaMask } from '../../hooks/useCustomMetaMask';

const { Header } = Layout;

export function NavBar() {
  const { status, connect, account } = useCustomMetaMask();

  function createAvatorUri(seed: string): string {
    return createAvatar(style, {
      seed,
      dataUri: true,
    });
  }

  return (
    <Header className='nav-bar'>
      <div className='logo'>
        <img src='/images/logo-text.svg' alt='' />
      </div>

      <div className='user'>
        {status === 'notConnected' && (
          <Button onClick={() => connect()}>Connect Wallet</Button>
        )}

        {status === 'connecting' && <Button loading>Connecting</Button>}

        {status === 'connected' && account && (
          <Tooltip
            title={`${account.substring(0, 8)}...${account.substring(
              account.length - 6
            )}`}
            color='#ff5b00'
            placement='bottomLeft'
          >
            <Avatar
              className='avatar'
              shape='square'
              size={36}
              src={createAvatorUri(account)}
            />
          </Tooltip>
        )}
      </div>
    </Header>
  );
}
