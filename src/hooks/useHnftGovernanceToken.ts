import Governance from '../contracts/HNFTGovernance.json';
import { AD3ContractAddress, HNFTGovernanceContractAddress } from '../models/hnft';
import { useContractRead, useAccount } from 'wagmi';
import GovernanceToken from '../contracts/HNFTGovernanceToken.json';
import { ethers } from 'ethers';

export interface HNFTGovernanceToken {
  address?: string;
  balance?: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  isAD3?: boolean;
}

export const useHnftGovernanceToken = (hnftAddress?: string, tokenId?: string) => {
  const { address } = useAccount();
  let { data: governanceTokenAddress } = useContractRead({
    address: HNFTGovernanceContractAddress,
    abi: Governance.abi,
    functionName: 'getGovernanceToken',
    args: [hnftAddress, tokenId],
  });

  const isAD3 = governanceTokenAddress === ethers.constants.AddressZero;
  governanceTokenAddress = isAD3 ? AD3ContractAddress : governanceTokenAddress;

  const { data: balance } = useContractRead({
    address: governanceTokenAddress as `0x${string}`,
    abi: GovernanceToken.abi,
    functionName: 'balanceOf',
    args: [address],
  });

  const { data: name } = useContractRead({
    address: governanceTokenAddress as `0x${string}`,
    abi: GovernanceToken.abi,
    functionName: 'name',
    args: [],
  });

  const { data: symbol } = useContractRead({
    address: governanceTokenAddress as `0x${string}`,
    abi: GovernanceToken.abi,
    functionName: 'symbol',
    args: [],
  });

  const { data: decimals } = useContractRead({
    address: governanceTokenAddress as `0x${string}`,
    abi: GovernanceToken.abi,
    functionName: 'decimals',
    args: [],
  });

  return {
    address: governanceTokenAddress,
    balance,
    name,
    symbol,
    decimals,
    isAD3
  } as HNFTGovernanceToken;
}