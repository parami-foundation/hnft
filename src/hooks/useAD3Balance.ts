import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useCustomMetaMask } from './useCustomMetaMask';
import { AD3ContractAddress } from '../models/contract';
import AD3Contract from '../AD3.json';
import { formatAd3Amount } from '../utils/format.util';

export const useAD3Blance = () => {
  const { chainId, account, ethereum } = useCustomMetaMask();
  const [balance, setBlance] = useState<string>();

  useEffect(() => {
    const fetchAD3Blance = async () => {
      if (ethereum && (chainId === 1 || chainId === 5)) {
        try {
          const hnftContract = new ethers.Contract(
            AD3ContractAddress[chainId],
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

    fetchAD3Blance();
  }, [chainId, account, ethereum]);

  return balance;
};
