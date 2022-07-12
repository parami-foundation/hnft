import './NavBar.scss';
import { useMetaMask } from 'metamask-react';
import { createAvatar } from '@dicebear/avatars';
import * as style from '@dicebear/avatars-identicon-sprites';
import { Layout, Menu, Button, Avatar, Tooltip } from 'antd';
import { Link } from "react-router-dom";


const { Header } = Layout;

export function NavBar() {
  const { status, connect, account } = useMetaMask();

  function createAvatorUri(seed: string): string {
    return createAvatar(style, {
      seed,
      dataUri: true
    });
  }
  
  return (
    <Header className='nav-bar'>
      <div className="logo" />

      <Menu mode="horizontal" theme="dark" defaultSelectedKeys={['workshop']}>
        <Menu.Item key="wnft">
          <Link to="">WNFT</Link>
        </Menu.Item>
        {/* <Menu.Item key="pfp">
          <Link to="pfp">PFP</Link>
        </Menu.Item> */}

        <Menu.Item className='right-menu' key="wallet" disabled>
          {status === 'notConnected' && (
            <Button ghost onClick={() => connect()}>Connect Wallet</Button>
          )}

          {status === 'connecting' && <Button ghost loading>Connecting</Button>}

          {status === 'connected' && account && (
            <Tooltip title={`${account.substring(0, 4)}...${account.substring(account.length - 4)}`} color="#108ee9" placement="bottom">
              <Avatar className='avatar' shape="square" size={32} src={createAvatorUri(account)} />
            </Tooltip>
          )}
        </Menu.Item>
      </Menu>

    </Header>

  );
}
