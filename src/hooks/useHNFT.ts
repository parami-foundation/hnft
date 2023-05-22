import { useEffect, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import { BillboardLevel2Name } from '../models/hnft';
import { useCustomMetaMask } from './useCustomMetaMask';
import { EIP5489ForInfluenceMiningContractAddress } from '../models/hnft';
import EIP5489ForInfluenceMining from '../EIP5489ForInfluenceMining.json';
import { amountToFloatString } from '../../src/utils/format.util';

export interface HNFT {
  address?: string;
  balance?: number;
  description?: string;
  image: string;
  name?: string;
  tokenId?: string;
  level?: string;
  price?: string;
  rank?: string;
  miningPower?: number;
  onWhitelist?: boolean;
}

export const useHNFT = () => {
  const { account, ethereum } = useCustomMetaMask();
  const [hnft, setHNFT] = useState<HNFT | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHnft = async () => {
      if (ethereum) {
        try {
          const hnftContract = new ethers.Contract(
            EIP5489ForInfluenceMiningContractAddress,
            EIP5489ForInfluenceMining.abi,
            new ethers.providers.Web3Provider(ethereum).getSigner()
          );
          const balance = await hnftContract.balanceOf(account);

          const tokenId = await hnftContract.tokenOfOwnerByIndex(account, 0);
          const tokenUri = await hnftContract.tokenURI(tokenId);

          const level = await hnftContract.token2Level(tokenId);

          const token = JSON.parse(atob(tokenUri.substring(29)));

          const levelString = BigNumber.from(level).toString();

          const price = await hnftContract.level2Price(levelString);

          const hnftData: HNFT = {
            ...token,
            price:
              amountToFloatString(BigNumber.from(price).toString(), 18) ?? 0,
            tokenId: tokenId?.toString(),
            address: EIP5489ForInfluenceMiningContractAddress,
            balance: balance?.toNumber() ?? 0,
            level: levelString,
            rank: BillboardLevel2Name[levelString],
          };
          setHNFT(hnftData);
          setLoading(false);
        } catch (error) {
          setHNFT(null);
          setLoading(false);
          console.error('Fetch new HNFT Error', error);
        }
      }
    };

    fetchHnft();
  }, [account, ethereum]);

  return {
    hnft,
    loading,
  };
};
