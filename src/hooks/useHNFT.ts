import { useAccount, useContractRead } from 'wagmi';
import { BillboardLevel2Name, HNFTGovernanceContractAddress } from '../models/hnft';
import { EIP5489ForInfluenceMiningContractAddress } from '../models/hnft';
import EIP5489ForInfluenceMining from '../contracts/EIP5489ForInfluenceMining.json';
import Governance from '../contracts/HNFTGovernance.json';

export interface HNFT {
  address?: string;
  balance?: number;
  description?: string;
  image?: string;
  name?: string;
  tokenId?: string;
  level: number;
  rank?: string;
  miningPower?: number;
  onWhitelist?: boolean;
  governanceTokenAddress?: string;
  refetch: () => void;
}

export const useHNFT = () => {
  const { address } = useAccount();

  const { data: nftBalance, refetch: refetchBalance } = useContractRead<
    unknown[],
    string,
    BigInt
  >({
    address: EIP5489ForInfluenceMiningContractAddress,
    abi: EIP5489ForInfluenceMining.abi,
    functionName: 'balanceOf',
    args: [address],
  });

  const { data: tokenId, refetch: refetchTokenId } = useContractRead({
    address: EIP5489ForInfluenceMiningContractAddress,
    abi: EIP5489ForInfluenceMining.abi,
    functionName: 'tokenOfOwnerByIndex',
    args: [address, 0],
  });

  const { data: tokenUri, refetch: refetchTokenUri } = useContractRead<
    unknown[],
    string,
    string
  >({
    address: EIP5489ForInfluenceMiningContractAddress,
    abi: EIP5489ForInfluenceMining.abi,
    functionName: 'tokenURI',
    args: [tokenId],
  });

  const { data: level, refetch: refetchLevel } = useContractRead<
    unknown[],
    string,
    string
  >({
    address: EIP5489ForInfluenceMiningContractAddress,
    abi: EIP5489ForInfluenceMining.abi,
    functionName: 'token2Level',
    args: [tokenId],
  });

  const { data: governanceTokenAddress, refetch: refetchGovernanceTokenAddress } = useContractRead<
    unknown[],
    string,
    string
  >({
    address: HNFTGovernanceContractAddress,
    abi: Governance.abi,
    functionName: 'getGovernanceToken',
    args: [EIP5489ForInfluenceMiningContractAddress, tokenId],
  });

  const { data: onWhitelist, refetch: refetchWhitelistStatus } =
    useContractRead({
      address: EIP5489ForInfluenceMiningContractAddress,
      abi: EIP5489ForInfluenceMining.abi,
      functionName: 'kolWhiteList',
      args: [address],
    });

  const token = tokenUri ? JSON.parse(atob(tokenUri.substring(29))) : {};
  const levelString = Number(level?.toString() ?? 0);

  const hnft: HNFT = {
    ...token,
    tokenId: tokenId?.toString(),
    address: EIP5489ForInfluenceMiningContractAddress,
    balance: nftBalance?.toString() ?? 0,
    onWhitelist: onWhitelist,
    level: levelString,
    rank: BillboardLevel2Name[levelString],
    governanceTokenAddress: governanceTokenAddress,
    refetch: () => {
      refetchBalance();
      refetchTokenId();
      refetchTokenUri();
      refetchLevel();
      refetchWhitelistStatus();
      refetchGovernanceTokenAddress();
    },
  };

  return hnft;
};
