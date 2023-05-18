import { useEffect, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import {
  BillboardLevel2MiningPower,
  BillboardLevel2Name,
} from '../models/hnft';
import { useCustomMetaMask } from './useCustomMetaMask';
import { HNFTCollectionContractAddress } from '../models/contract';
import HNFTGovernance from '../HNFTGovernance.json';
import { useHNFT } from './useHNFT';

export interface HNFT {
  address?: string;
  balance?: number;
  description?: string;
  image: string;
  name?: string;
  tokenId?: string;
  level?: string;
  rank?: string;
  miningPower?: number;
  onWhitelist?: boolean;
}

export const useHNFTGovernance = () => {
  const { chainId, account, ethereum } = useCustomMetaMask();
  const { hnft } = useHNFT();

  useEffect(() => {
    const fetchHnft = async () => {
      if (ethereum && (chainId === 1 || chainId === 5)) {
        try {
          const hnftContract = new ethers.Contract(
            HNFTCollectionContractAddress[chainId],
            HNFTGovernance.abi,
            new ethers.providers.Web3Provider(ethereum).getSigner()
          );
          const token = hnftContract.getGovernanceToken(hnft?.tokenId, );
        } catch (error) {
          console.error('Fetch new HNFT Error', error);
        }
      }
    };

    fetchHnft();
  }, [chainId, account, ethereum]);

  return {
    hnft,
    loading: !hnft,
  };
};
