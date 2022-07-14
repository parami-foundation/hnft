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

export interface WNFT {
  nft: NFT;
  contractInfo: WnftData;
}

export type LinkPrefixType = 'https://' | 'ipfs://' | 'wnft://' | 'did://';

export const DEFAULT_LINK = 'https://app.parami.io';

export interface Collection {
  slug: string;
  name: string;
  banner_image_url?: string;
  featured_image_url?: string;
  image_url?: string;
  description?: string;
}

export interface NFT {
  token_id: string;
  image_url: string;
  name: string;
  description: string;
  asset_contract: {
    address: string;
    name: string;
  }
}
