import { useContractReads } from "wagmi";
import Governance from '../contracts/HNFTGovernance.json';
import { EIP5489ForInfluenceMiningContractAddress, HNFTGovernanceContractAddress } from '../models/hnft';
import EIP5489ForInfluenceMining from '../contracts/EIP5489ForInfluenceMining.json';
import GovernanceToken from '../contracts/HNFTGovernanceToken.json';

export const useNFTTokenUris = (tokenIds: number[]) => {
  const { data: tokenURIs } = useContractReads({
    contracts: tokenIds.map(tokenId => {
      return {
        address: EIP5489ForInfluenceMiningContractAddress,
        abi: EIP5489ForInfluenceMining.abi,
        functionName: 'tokenURI',
        args: [tokenId]
      } as any
    })
  });

  const { data: governanceTokenAddresses } = useContractReads({
    contracts: tokenIds.map(tokenId => {
      return {
        address: HNFTGovernanceContractAddress,
        abi: Governance.abi,
        functionName: 'getGovernanceToken',
        args: [EIP5489ForInfluenceMiningContractAddress, tokenId],
      } as any
    })
  });

  const { data: symbols } = useContractReads({
    contracts: governanceTokenAddresses?.map(governanceTokenAddress => {
      return {
        address: governanceTokenAddress.result,
        abi: GovernanceToken.abi,
        functionName: 'symbol',
        args: [],
      } as any
    })
  });

  return tokenIds?.length ? (tokenURIs ?? []).map((tokenURIRes, index) => {
    const uri = tokenURIRes.result as string;
    const token = uri ? JSON.parse(atob(uri.substring(29))) : {};
    return {
      name: token.name,
      image: token.image,
      symbol: symbols?.[index]?.result,
    } as { name: string, image: string, symbol: string };
  }) : [];
}