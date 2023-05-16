import { Button, Card, Image, message } from 'antd';
import { ethers } from 'ethers';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import { useOpenseaApi } from '../../hooks/useOpenseaApi';
import { HNFTCollectionContractAddress } from '../../models/contract';
import ERC721HCollection from '../../ERC721HCollection.json';
import { NFT } from '../../models/wnft';
import './MintHNFT.scss';
import { useCustomMetaMask } from '../../hooks/useCustomMetaMask';
import { useWContractAddresses } from '../../hooks/useWContractAddresses';
import { CreateHnftModal } from '../../components/CreateHnftModal';

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
  const [visible, setVisible] = useState<boolean>(true);
  const { ethereum, chainId, status, account } = useCustomMetaMask();
  const { retrieveCollections, retrieveNFTs } = useOpenseaApi();
  const [hnftContract, setHnftContract] = useState<ethers.Contract>();
  const [hnfts, setHnfts] = useState<NFT[]>();
  const wContractAddress = useWContractAddresses();

  useEffect(() => {
    if (ethereum && (chainId === 1 || chainId === 5)) {
      setHnftContract(
        new ethers.Contract(
          HNFTCollectionContractAddress[chainId],
          ERC721HCollection.abi,
          new ethers.providers.Web3Provider(ethereum).getSigner()
        )
      );
    }
  }, [ethereum, chainId]);

  useEffect(() => {
    if (retrieveCollections && chainId && wContractAddress) {
      retrieveCollections()
        .then((collections) => {
          const hnftCollections = (collections ?? []).filter((collection) => {
            return collection?.primary_asset_contracts?.find((contract) => {
              return [
                HNFTCollectionContractAddress[chainId as 1 | 5],
                ...wContractAddress,
              ].find((addr) => contract.address === addr);
            });
          });

          const contractAddresses = hnftCollections
            .map((collection) => {
              const contracts = collection.primary_asset_contracts;
              if (contracts?.length) {
                return contracts[0].address;
              }
              return '';
            })
            .filter(Boolean);

          return retrieveNFTs({
            contractAddresses,
          });
        })
        .then((nfts) => {
          setHnfts([...(nfts ?? [])]);
        });
    }
  }, [retrieveCollections, retrieveNFTs, chainId, wContractAddress]);

  const onCreateNewHNFT = useCallback(async () => {
    setVisible(false);
    if (hnftContract && account) {
      try {
        const balance = await hnftContract.balanceOf(account);
        const tokenId = await hnftContract.tokenOfOwnerByIndex(
          account,
          balance - 1
        );
        const tokenUri = await hnftContract.tokenURI(tokenId);

        const tokenMetadata = JSON.parse(atob(tokenUri.substring(29)));

        const newHNFT = {
          name: tokenMetadata.name,
          token_id: tokenId,
          image_url: tokenMetadata.image,
          description: tokenMetadata.description,
          asset_contract: {
            address: hnftContract.address,
            name: tokenMetadata.name,
          },
        };

        setHnfts([newHNFT]);
      } catch (e) {
        console.error('Fetch new HNFT Error', JSON.stringify(e));
      }
    }
  }, [hnftContract, account, hnfts]);

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
    <>
      <div className='title-container'>
        <div className='title'>Mint my hNFTs</div>
        <div className='sub-title'>Unlock the power of hyperlink with HNFT</div>

        {/* todo: connect wallet here */}
      </div>

      <div className='select-network'>
        <div className='title'>Select Network</div>
        <div className='network-list'>
          {SupportedNetworkList.map((ele) => (
            <div className='network-item' key={ele.id}>
              <Image
                src={`/images/icon/${ele.icon}`}
                style={{ width: '45px' }}
                preview={false}
              ></Image>
              <span className='network-name'>{ele.value}</span>
            </div>
          ))}
        </div>
      </div>

      {!hnfts && (
        <div className='no-nfts-container'>
          <Image
            src='/images/icon/vector.svg'
            style={{ width: '120px' }}
            preview={false}
          ></Image>
          <div className='tips'>You do not have any HNFTs</div>
          {buttons}
        </div>
      )}
      {visible && (
        <CreateHnftModal
          onCreate={onCreateNewHNFT}
          onCancel={() => setVisible(false)}
        />
      )}
    </>
  );
}
