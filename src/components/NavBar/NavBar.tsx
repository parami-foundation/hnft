import { createAvatar } from '@dicebear/core';
import * as lorelei from '@dicebear/lorelei';
import { isMobile } from 'react-device-detect';
import { useWeb3Modal } from '@web3modal/react';
import { Layout, Button, Avatar, Tooltip, message, notification } from 'antd';
import { useAccount, useConnect, useNetwork, useSignMessage } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import './NavBar.scss';
import { useEffect, useState } from 'react';
import SigninModal from '../SigninModal/SigninModal';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { bindWallet, createAccountOrLogin, getAccount } from '../../services/relayer.service';
import { BIND_WALLET_MESSAGE, CLAIM_AD_STATE_PREFIX } from '../../models/hnft';

const { Header } = Layout;

export function NavBar() {
  const navigate = useNavigate();
  const [showLoginBtn, setShowLoginBtn] = useState<boolean>(false);
  const [showBindWalletBtn, setShowBindWalletBtn] = useState<boolean>(false);
  const [signinModal, setSigninModal] = useState<boolean>(false);
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { chain } = useNetwork();
  const { connect, connectors, isLoading } = useConnect({
    connector: new InjectedConnector(),
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const { data: signature, error: signMsgError, isLoading: signMsgLoading, signMessage } = useSignMessage()

  useEffect(() => {
    if (signMsgError) {
      notification.warning({
        message: signMsgError.message
      })
    }
  }, [signMsgError])

  useEffect(() => {
    getAccount().then(res => {
      if (!res) {
        setShowLoginBtn(true);
      } else {
        console.log('got user account', res);
        if (!res.wallets.length) {
          setShowBindWalletBtn(true);
        }
      }
    })
  }, []);

  useEffect(() => {
    if (signature) {
      bindWallet(address!, chain!.id, BIND_WALLET_MESSAGE, signature).then(res => {
        if (res.success) {
          notification.success({
            message: 'bind wallet success'
          });
          setShowBindWalletBtn(false);
        } else {
          notification.warning({
            message: `bind wallet error ${res.message ?? ''}`
          })
        }
      })
    }
  }, [signature])

  useEffect(() => {
    if (searchParams) {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      if (code) {
        createAccountOrLogin(code).then((res) => {
          if (!res.success) {
            notification.warning({
              message: `Login Error ${res.message}`,
            })
            return;
          }
          if (state && state.startsWith(CLAIM_AD_STATE_PREFIX)) {
            navigate(`/claim?bidId=${state.slice(CLAIM_AD_STATE_PREFIX.length)}`);
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
    if (chain?.id && chain.id !== 5) {
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
          <div className='action-btn-container'>
            <Button onClick={() => {
              setSigninModal(true);
            }} type="primary">login</Button>
          </div>
        </>}

        {showBindWalletBtn && <>
          <div className='action-btn-container'>
            <Button onClick={() => {
              // sign message and bind wallet
              signMessage({ message: BIND_WALLET_MESSAGE })
            }} type="primary">bind wallet</Button>
          </div>
        </>}

        <div className='user'>
          {!isConnected && (
            <Button onClick={walletConnect} loading={isLoading} type="primary">
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
