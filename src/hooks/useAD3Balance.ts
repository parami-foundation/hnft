import { useAccount, useContractRead } from 'wagmi';
import { AD3ContractAddress } from '../models/hnft';
import AD3Contract from '../contracts/AD3.json';
import { amountToFloatString } from '../utils/format.util';

export const useAD3Balance = () => {
  const { address } = useAccount();

  const { data: nftBalance } = useContractRead<unknown[], string, bigint>({
    address: AD3ContractAddress,
    abi: AD3Contract.abi,
    functionName: 'balanceOf',
    args: [address],
  });

  return Number(amountToFloatString(nftBalance!) ?? 0);
};
