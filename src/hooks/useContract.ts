import { useEffect, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import {
  BillboardLevel2MiningPower,
  BillboardLevel2Name,
} from '../models/hnft';
import { useCustomMetaMask } from './useCustomMetaMask';
import { HNFTCollectionContractAddress } from '../models/contract';

export const useContract = (contractABI: any) => {
  const { ethereum, chainId, account } = useCustomMetaMask();
  const [contract, setContract] = useState<ethers.Contract>();

  useEffect(() => {
    if (ethereum && (chainId === 1 || chainId === 5)) {
      const instance = new ethers.Contract(
        HNFTCollectionContractAddress[chainId],
        contractABI,
        new ethers.providers.Web3Provider(ethereum).getSigner()
      );
      setContract(instance);
    }
  }, [ethereum, chainId, account, contractABI]);

  return contract;
};
