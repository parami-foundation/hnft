import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useCustomMetaMask } from './useCustomMetaMask';
import { AD3ContractAddress } from '../models/hnft';
import AD3Contract from '../contracts/AD3.json';
import { formatAd3Amount } from '../utils/format.util';

export const useAD3Balance = () => {
  const { account, ethereum } = useCustomMetaMask();
  const [balance, setBlance] = useState<number>();

  useEffect(() => {
    const fetchAD3Balance = async () => {
      if (ethereum) {
        try {
          const hnftContract = new ethers.Contract(
            AD3ContractAddress,
            AD3Contract.abi,
            new ethers.providers.Web3Provider(ethereum).getSigner()
          );
          const balance = await hnftContract.balanceOf(account);

          setBlance(formatAd3Amount(balance));
        } catch (error) {
          console.error('Fetch new HNFT Error', error);
        }
      }
    };

    fetchAD3Balance();
  }, [account, ethereum]);

  return balance ?? 0;
};
