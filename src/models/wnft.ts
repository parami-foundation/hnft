import { ethers } from "ethers";

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

export const IPFS_ENDPOINT = 'https://ipfs.parami.io/ipfs/';

export const IPFS_UPLOAD = 'https://ipfs.parami.io/api/v0/add?stream-channels=true';

export const HNFT_IDENTIFIER = 1;

export const hexStartingIndex = 8;
export const tokenIdStartingIndex = 224;

export interface AssetContract {
  name: string;
  address: string;
}

export interface Collection {
  slug: string;
  name: string;
  banner_image_url?: string;
  featured_image_url?: string;
  image_url?: string;
  description?: string;
  primary_asset_contracts?: AssetContract[];
}

export interface NFT {
  token_id: string;
  image_url: string;
  name: string;
  description: string;
  asset_contract: AssetContract
}
