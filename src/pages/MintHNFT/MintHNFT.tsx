import { Button, Card, Image, message } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import { useSearchParams } from 'react-router-dom';
import { useHNFT, useCustomMetaMask } from '../../hooks';
import { CreateHnftModal } from '../../components/CreateHnftModal';
import MintSuccess from '../../components/MintSuccess/MintSuccess';
import { NETWORK_CONFIG, MINT_NFT_TYPE } from '../../models/hnft';
import './MintHNFT.scss';
import { fetchTwitterUser, requestTwitterOauthUrl, TwitterUser } from '../../services/twitter.service';

export interface MintHNFTProps { }

export function MintHNFT({ }: MintHNFTProps) {
  const [visible, setVisible] = useState<boolean>(false);
  const { hnft } = useHNFT();
  const { status } = useCustomMetaMask();
  const mintSuccessRef = useRef<HTMLDivElement>() as any;
  const [searchParams, setSearchParams] = useSearchParams();
  const [twitterUser, setTwitterUser] = useState<TwitterUser | null>();

  useEffect(() => {
    if (searchParams) {
      const oauth_token = searchParams.get('oauth_token');
      const oauth_verifier = searchParams.get('oauth_verifier')
      
      if (oauth_token && oauth_verifier) {
        fetchTwitterUser(oauth_token, oauth_verifier).then(twitterUser => {
          setTwitterUser(twitterUser);
          setSearchParams({});
        })
      }
    }
  }, [searchParams]);

  const handleConnectTwitter = async () => {
    const oauthUrl = await requestTwitterOauthUrl();
    if (oauthUrl) {
      if (isMobile) {
        window.location.href = `${oauthUrl}`;
        return;
      }
      // direct oauth
      window.location.href = oauthUrl;
    }
  };

  const mintHnft = (mint: MINT_NFT_TYPE) => {
    if (status !== 'connected') {
      message.info('Connect your wallet and start managing your HNFTs!');
      return;
    }

    if (mint === MINT_NFT_TYPE.IMAGE) {
      setVisible(true);
    }

    if (mint === MINT_NFT_TYPE.TWITTER) {
      handleConnectTwitter();
    }
  };

  const onCreateSuccess = () => {
    setVisible(false);
    mintSuccessRef?.current?.onCreateSuccess();
  };

  const buttons = (
    <div className='buttons'>
      <Button onClick={() => mintHnft(MINT_NFT_TYPE.TWITTER)}>
        Mint from Twitter Avatar
      </Button>
      <Button onClick={() => mintHnft(MINT_NFT_TYPE.IMAGE)}>
        Mint from image
      </Button>
    </div>
  );

  return (
    <div className='mint-hnft'>
      <div className='title-container'>
        <div className='title'>Mint my hNFTs</div>
        <div className='sub-title'>Unlock the power of hyperlink with HNFT</div>
      </div>

      <div className='select-network'>
        <div className='title'>Select Network</div>
        <div className='network-list'>
          {NETWORK_CONFIG.map((ele: any) => (
            <div className='network-item' key={ele.id}>
              <Image
                src={`/network/${ele.icon}`}
                style={{ width: '45px' }}
                preview={false}
              ></Image>
              <span className='network-name'>{ele.value}</span>
            </div>
          ))}
        </div>
      </div>

      {!hnft && (
        <div className='no-nfts-container'>
          <Image
            src='/network/vector.svg'
            style={{ width: '120px' }}
            preview={false}
          ></Image>
          <div className='tips'>You don't have any Hnft</div>
          {buttons}
        </div>
      )}
      {visible && (
        <CreateHnftModal
          onCreate={onCreateSuccess}
          onCancel={() => setVisible(false)}
        />
      )}

      <MintSuccess ref={mintSuccessRef} />

      <Card title='Hyperlink NFT Extension'>
        <Link
          to='https://chrome.google.com/webstore/detail/hyperlink-nft-extension/gilmlbeecofjmogfkaocnjmbiblmifad'
          target='_blank'
        >
          Click to install Hyperlink NFT Extension
        </Link>
      </Card>
    </div>
  );
}
