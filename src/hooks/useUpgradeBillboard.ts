import { useEffect, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import {
  BillboardLevel2MiningPower,
  BillboardLevel2Name,
} from '../models/hnft';
import { useCustomMetaMask } from './useCustomMetaMask';
import { HNFTCollectionContractAddress } from '../models/contract';
import EIP5489ForInfluenceMining from '../EIP5489ForInfluenceMining.json';

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

export const useUpgradeBillboard = (tokenId?: string, level?: number) => {
  const { ethereum, chainId, account } = useCustomMetaMask();
  const [hnft, setHNFT] = useState<HNFT | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      if (ethereum && (chainId === 1 || chainId === 5)) {
        const hnftContract = new ethers.Contract(
          HNFTCollectionContractAddress[chainId],
          EIP5489ForInfluenceMining.abi,
          new ethers.providers.Web3Provider(ethereum).getSigner()
        );

        try {
          const upgradeHnft = await hnftContract.balanceOf(account);
        } catch (error) {
          console.error('Fetch new HNFT Error', error);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [ethereum, chainId, account]);

  return {
    // upgradeHnft,
    // isLoading: writeLoading || waitTxLoading,
    // isSuccess: upgradeSuccess,
    // isError,
    // error: error,
    // prepareError,
  };
};
