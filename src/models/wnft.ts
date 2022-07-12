import { ethers } from "ethers";
import { type } from "os";

export type ContractType = 'NFT' | 'WNFT';

export interface NftInfo {
  contractType: ContractType
  contractAddress: string;
  tokenId: number;
}

export interface WnftData {
  contractAddress: string;
  tokenId: number;
  contract: ethers.Contract;
}

export type LinkPrefixType = 'https://' | 'ipfs://' | 'wnft://' | 'did://';

export const DEFAULT_LINK = 'https://app.parami.io';
