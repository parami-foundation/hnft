import { useMetaMask } from "metamask-react";
import { useCallback } from "react";
import { Collection, NFT } from "../models/wnft";

const OpenseaApiServer = 'https://ipfs.parami.io';
// const OpenseaApiServer = 'http://localhost:8081';

export function useOpenseaApi() {
  const { chainId, account } = useMetaMask();

  const chain_id = parseInt(chainId ?? '', 16);

  const retrieveCollections = useCallback(() => {
    if (!chain_id || !account) {
      return Promise.resolve([]);
    }
    const options = { method: 'GET' };
    return fetch(`${OpenseaApiServer}/api/os/collections?chainId=${chain_id}&asset_owner=${account}&offset=0&limit=300`, options)
      .then(response => {
        return response.json() as Promise<Collection[]>;
      })
      .catch(err => console.error(err));
  }, [chain_id, account]);

  const retrieveNFTs = useCallback((searchParams: {
    collectionSlug?: string,
    contractAddresses?: string[]
  } = {}) => {
    if (!chain_id || !account) {
      return Promise.resolve([]);
    }
    const options = { method: 'GET' };
    let searchParamsString = `chainId=${chain_id}&owner=${account}&order_direction=desc&offset=0&limit=20&include_orders=false`;

    if (searchParams.collectionSlug) {
      searchParamsString += `&collection=${searchParams.collectionSlug}`;
    }

    if (searchParams.contractAddresses?.length) {
      searchParamsString += `&${searchParams.contractAddresses.map(addr => `asset_contract_addresses=${addr}`).join('&')}`;
    }

    return fetch(`${OpenseaApiServer}/api/os/assets?${searchParamsString}`, options)
      .then(response => response.json())
      .then(resp => resp.assets ?? [] as NFT[])
      .catch(err => console.error(err));
  }, [chain_id, account]);

  const retrieveAsset = useCallback((address: string, tokenId: number) => {
    const options = { method: 'GET' };
    return fetch(`${OpenseaApiServer}/api/os/asset/${address}/${tokenId}?chainId=${chain_id}`, options)
      .then(response => response.json())
      .catch(err => console.error(err));
  }, [chain_id]);

  const retrieveContract = useCallback((address: string) => {
    const options = { method: 'GET' };
    return fetch(`${OpenseaApiServer}/api/os/asset_contract/${address}?chainId=${chain_id}`, options)
      .then(response => response.json())
      .catch(err => console.error(err));
  }, [chain_id])

  return {
    retrieveCollections,
    retrieveNFTs,
    retrieveAsset,
    retrieveContract
  }
}