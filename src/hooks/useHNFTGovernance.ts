import { useEffect, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import { useCustomMetaMask } from './useCustomMetaMask';
import { HNFTGovernanceContractAddress } from '../models/hnft';
import HNFTGovernance from '../HNFTGovernance.json';
import { HNFT } from './useHNFT';

export const useHNFTGovernance = (hnft: HNFT) => {
  const { account, ethereum } = useCustomMetaMask();
  const [token, setToken] = useState<number>();

  useEffect(() => {
    const fetchMyToken = async () => {
      if (ethereum && hnft) {
        try {
          const hnftContract = new ethers.Contract(
            HNFTGovernanceContractAddress,
            HNFTGovernance.abi,
            new ethers.providers.Web3Provider(ethereum).getSigner()
          );
          const tokenAddress = await hnftContract.getGovernanceToken(
            account,
            hnft?.tokenId
          );

        } catch (error) {
          console.error('Fetch My Token Error', error);
        }
      }
    };

    fetchMyToken();
  }, [account, ethereum, hnft]);

  return token;
};
