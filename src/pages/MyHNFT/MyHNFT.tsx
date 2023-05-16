import { Button, Card } from 'antd';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Hnft } from '../Hnft';
import { NFT } from '../../models/wnft';
import { useCustomMetaMask } from '../../hooks/useCustomMetaMask';
import { MintHNFT } from '../MintHNFT';
import './MyHNFT.scss';

export interface MyHNFTProps {}

export function MyHNFT({}: MyHNFTProps) {
  const { ethereum, chainId, status, account } = useCustomMetaMask();
  const [hnft, setHnft] = useState<NFT[]>();

  useEffect(() => {
    if (ethereum && (chainId === 1 || chainId === 5)) {
      // setHnftContract(
      //   new ethers.Contract(
      //     HNFTCollectionContractAddress[chainId],
      //     ERC721HCollection.abi,
      //     new ethers.providers.Web3Provider(ethereum).getSigner()
      //   )
      // );
    }
  }, [ethereum, chainId]);

  return (
    <div className='my-nfts'>
      {hnft ? <Hnft /> : <MintHNFT />}
      {/* {hnft ? <MintHNFT /> : <Hnft />} */}

      <Card style={{ marginTop: '40px' }} title='Parami Extension Download'>
        <Link to='/files/Parami-Extension-v0.0.3.zip' target='_blank' download>
          Click to download Parami Extension
        </Link>
      </Card>
    </div>
  );
}
