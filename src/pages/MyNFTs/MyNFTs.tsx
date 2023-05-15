import { Button, Card, Typography, Image, Spin, message } from 'antd';
import { ethers } from 'ethers';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOpenseaApi } from '../../hooks/useOpenseaApi';
import { HNFTCollectionContractAddress } from '../../models/contract';
import { Hnft } from '../Hnft';
import { Wnft } from '../Wnft';
import ERC721HCollection from '../../ERC721HCollection.json';
import { NFT } from '../../models/wnft';
import { HnftCard } from '../../components/HnftCard';
import './MyNFTs.scss';
import { useCustomMetaMask } from '../../hooks/useCustomMetaMask';
import { useWContractAddresses } from '../../hooks/useWContractAddresses';

const { Title } = Typography;

export enum MINT_NFT_TYPE {
  IMAGE = 'image',
  TWITTER = 'twitter',
}

export interface MyNFTsProps {}

export function MyNFTs({}: MyNFTsProps) {
  const [selectNFTModal, setSelectNFTModal] = useState<boolean>();
  const [createHNFTModal, setCreateHNFTModal] = useState<boolean>();
  const { ethereum, chainId, status, account } = useCustomMetaMask();
  const { retrieveCollections, retrieveNFTs } = useOpenseaApi();
  const [hnftContract, setHnftContract] = useState<ethers.Contract>();
  const [hnfts, setHnfts] = useState<NFT[]>();
	const wContractAddress = useWContractAddresses();
	
	console.log(chainId, '---chainId---');

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
    setCreateHNFTModal(false);
    if (hnftContract && account && hnfts) {
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

        setHnfts([newHNFT, ...hnfts]);
      } catch (e) {
        console.error('Fetch new HNFT Error', JSON.stringify(e));
      }
    }
  }, [hnftContract, account, hnfts]);

  const onCreateNewWNFT = useCallback(
    (wnft: NFT) => {
      if (hnfts) {
        setHnfts([wnft, ...hnfts]);
        setSelectNFTModal(false);
      }
    },
    [hnfts]
  );

  const removeNft = (removed: NFT) => {
    setHnfts([
      ...(hnfts ?? []).filter(
        (nft) =>
          !(nft.name === removed.name && nft.token_id === removed.token_id)
      ),
    ]);
  };

  const mintHnft = (mint: MINT_NFT_TYPE) => {
    if (status !== 'connected') {
      message.info('Connect your wallet and start managing your HNFTs!');
      return;
    }

    if (mint === MINT_NFT_TYPE.IMAGE) {
      setCreateHNFTModal(true);
    }

    if (mint === MINT_NFT_TYPE.TWITTER) {
      setSelectNFTModal(true);
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
    <div className='my-nfts'>
      <div className='title-container'>
        <div className='title'>Mint my hNFTs</div>

        <div className='sub-title'>Unlock the power of hyperlink with HNFT</div>

        {/* todo: connect wallet here */}
      </div>

      <div className='select-network'>
        <div className='title'>Select Network</div>
      </div>

      {/* {!hnfts && (
        <div className='loading-container'>
          <Spin tip='Loading...' />
        </div>
      )} */}

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

      {hnfts && hnfts.length > 0 && (
        <div className='nfts-container'>
          {hnfts?.map((hnft) => (
            <HnftCard
              key={`${hnft.name}${hnft.token_id}`}
              hnft={hnft}
              unwrapped={() => removeNft(hnft)}
            />
          ))}
          {buttons}
        </div>
      )}

      <Card style={{ marginTop: '40px' }} title='Parami Extension Download'>
        <Link to='/files/Parami-Extension-v0.0.3.zip' target='_blank' download>
          Click to download Parami Extension
        </Link>
      </Card>

      {selectNFTModal && (
        <Wnft
          onCancel={() => setSelectNFTModal(false)}
          onCreateWNFT={(nft) => onCreateNewWNFT(nft)}
        />
      )}
      {createHNFTModal && (
        <Hnft
          onCancel={() => setCreateHNFTModal(false)}
          onCreate={onCreateNewHNFT}
        />
      )}
    </div>
  );
}
