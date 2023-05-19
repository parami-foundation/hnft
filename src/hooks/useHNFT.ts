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

export const useHNFT = () => {
  const { chainId, account, ethereum } = useCustomMetaMask();
  const [hnft, setHNFT] = useState<HNFT | null>(null);

  useEffect(() => {
    const fetchHnft = async () => {
      if (
        ethereum &&
        (chainId === 1 || chainId === 5)
      ) {
        try {
          const hnftContract = new ethers.Contract(
            HNFTCollectionContractAddress[chainId],
            EIP5489ForInfluenceMining.abi,
            new ethers.providers.Web3Provider(ethereum).getSigner()
          );
          const balance = await hnftContract.balanceOf(account);

          const tokenId = await hnftContract.tokenOfOwnerByIndex(
            account,
            0
          );
          const tokenUri = await hnftContract.tokenURI(tokenId);

          const token = JSON.parse(atob(tokenUri.substring(29)));

          const levelString = token.level?.toString() ?? '0';

          const price = await hnftContract.level2Price(levelString);

          const hnftData: HNFT = {
            ...token,
            price: BigNumber.from(price).toNumber() ?? 0,
            tokenId: tokenId?.toString(),
            address: HNFTCollectionContractAddress[chainId],
            balance: balance?.toNumber() ?? 0,
            level: levelString,
            rank: BillboardLevel2Name[levelString],
            miningPower: BillboardLevel2MiningPower[levelString],
          };
          setHNFT(hnftData);
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
