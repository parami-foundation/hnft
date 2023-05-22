import { Button, Card, Image, message } from 'antd';
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import { useHNFT } from '../../hooks/useHNFT';
import { useCustomMetaMask } from '../../hooks/useCustomMetaMask';
import { CreateHnftModal } from '../../components/CreateHnftModal';
import MintSuccess from '../../components/MintSuccess/MintSuccess';
import './MintHNFT.scss';

const SupportedNetworkList = [
  { id: 'ERC-20', value: 'ERC-20', icon: 'erc.svg' },
  { id: 'ARB-one', value: 'ARB-one', icon: 'arb.svg' },
  { id: 'Optimism', value: 'Optimism', icon: 'optimism.svg' },
  { id: 'BEP-20', value: 'BEP-20', icon: 'bep.svg' },
  { id: 'Sloana', value: 'Sloana', icon: 'sloana.svg' },
];

export enum MINT_NFT_TYPE {
  IMAGE = 'image',
  TWITTER = 'twitter',
}

export const getTwitterOauthUrl = async (tag: string | undefined | null) => {
  try {
    const resp = await fetch(
      `https://staging.parami.io/airdrop/influencemining/api/twitter/login?state=${
        tag ? `tag_${tag}` : 'gptminer_login'
      }`
    );
    const { oauthUrl } = await resp.json();
    return oauthUrl;
  } catch (e) {
    console.log('request_oauth_token error', e);
    return;
  }
};

export interface MintHNFTProps {}

export function MintHNFT({}: MintHNFTProps) {
  const [visible, setVisible] = useState<boolean>(false);
  const { hnft } = useHNFT();
  const { status } = useCustomMetaMask();
  const mintSuccessRef = useRef<HTMLDivElement>() as any;

  const handleConnectTwitter = async () => {
    const oauthUrl = await getTwitterOauthUrl(null);
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
          {SupportedNetworkList.map((ele) => (
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
          <div className='tips'>You do not have any HNFTs</div>
          {buttons}
        </div>
      )}
      {visible && (
        <CreateHnftModal
          onCreate={onCreateSuccess}
          onCancel={() => setVisible(false)}
        />
      )}

      <MintSuccess hnft={hnft!} ref={mintSuccessRef} />

      <Card title='Parami Extension Download'>
        <Link to='/files/Parami-Extension-v0.0.3.zip' target='_blank' download>
          Click to download Parami Extension
        </Link>
      </Card>
    </div>
  );
}
