import { useEffect, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import { useCustomMetaMask } from './useCustomMetaMask';
import { HNFTGovernanceContractAddress } from '../models/contract';
import HNFTGovernance from '../HNFTGovernance.json';
import { HNFT } from './useHNFT';

export const useHNFTGovernance = (hnft: HNFT) => {
  const { chainId, account, ethereum } = useCustomMetaMask();
  const [token, setToken] = useState<number>();

  useEffect(() => {
    const fetchMyToken = async () => {
      if (ethereum && hnft && (chainId === 1 || chainId === 5)) {
        try {
          const hnftContract = new ethers.Contract(
            HNFTGovernanceContractAddress[chainId],
            HNFTGovernance.abi,
            new ethers.providers.Web3Provider(ethereum).getSigner()
          );
          const token = await hnftContract.getGovernanceToken(
            account,
            hnft?.tokenId
          );
          setToken(BigNumber.from(token).toNumber());
        } catch (error) {
          console.error('Fetch My Token Error', error);
        }
      }
    };

    fetchMyToken();
  }, [chainId, account, ethereum, hnft]);

  return token;
};
