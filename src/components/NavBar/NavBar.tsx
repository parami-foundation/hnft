import { createAvatar } from '@dicebear/core';
import * as lorelei from '@dicebear/lorelei';
import { isMobile } from 'react-device-detect';
import { useWeb3Modal } from '@web3modal/react';
import { Layout, Button, Avatar, Tooltip, message, notification } from 'antd';
import { useAccount, useConnect, useNetwork } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import './NavBar.scss';
import { useEffect, useState } from 'react';
import SigninModal from '../SigninModal/SigninModal';
import { useSearchParams } from 'react-router-dom';
import { createAccountOrLogin, getAccount } from '../../services/relayer.service';

const { Header } = Layout;

export function NavBar() {
  const [showLoginBtn, setShowLoginBtn] = useState<boolean>(false);
  const [signinModal, setSigninModal] = useState<boolean>(false);
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { chain } = useNetwork();
  const { connect, connectors, isLoading } = useConnect({
    connector: new InjectedConnector(),
  });

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    getAccount().then(res => {
      if (!res) {
        setShowLoginBtn(true);
      } else {
        console.log('got user account', res);
      }
    })
  }, []);

  useEffect(() => {
    if (searchParams) {
      const code = searchParams.get('code');
      if (code) {
        createAccountOrLogin(code).then((res) => {
          if (!res.success) {
            notification.warning({
              message: `Login Error ${res.message}`,
            })
          }
        })
      }
    }
  }, [searchParams]);

  function createAvatorUri(seed: string): string {
    return createAvatar(lorelei, {
      seed,
    }).toDataUriSync();
  }

  const walletConnect = () => {
    if (chain?.id !== 5) {
      message.info('Please switch to the test network goerli');
      return;
    }

    if (isMobile) {
      open();
    } else {
      connect({ connector: connectors[0] });
    }
  };

  return (
    <>
      <Header className='nav-bar'>
        <div className='logo-container'>
          <div className='logo'>
            <img src='/images/logo-text.svg' alt='' />
          </div>
        </div>

        {showLoginBtn && <>
          <div className='login'>
            <Button onClick={() => {
              setSigninModal(true);
            }} type="primary">login</Button>
          </div>
        </>}

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

      {signinModal && <>
        <SigninModal onClose={() => {
          setSigninModal(false);
        }}></SigninModal>
      </>}
    </>
  );
}
