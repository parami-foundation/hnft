import { useMetaMask } from "metamask-react";

const OpenseaApiServer = 'https://ipfs.parami.io'

export function useOpenseaApi() {
  const { chainId, account } = useMetaMask();

  const chain_id = parseInt(chainId ?? '', 16);

  const retrieveCollections = () => {
    const options = { method: 'GET' };
    return fetch(`${OpenseaApiServer}/api/os/collections?chainId=${chain_id}&asset_owner=${account}&offset=0&limit=300`, options)
      .then(response => {
        console.log(response);
        return response.json();
      })
      .catch(err => console.error(err));
  }

  const retrieveNFTs = (collectionSlug: string) => {
    const options = { method: 'GET' };
    return fetch(`${OpenseaApiServer}/api/os/assets?chainId=${chain_id}&owner=${account}&order_direction=desc&offset=0&limit=20&collection=${collectionSlug}&include_orders=false`, options)
      .then(response => response.json())
      .catch(err => console.error(err));
  }

  const retrieveAsset = (address: string, tokenId: number) => {
    const options = { method: 'GET' };
    return fetch(`${OpenseaApiServer}/api/os/asset/${address}/${tokenId}?chainId=${chain_id}`, options)
      .then(response => response.json())
      .catch(err => console.error(err));
  }

  const retrieveContract = (address: string) => {
    const options = { method: 'GET' };
    return fetch(`${OpenseaApiServer}/api/os/asset_contract/${address}?chainId=${chain_id}`, options)
      .then(response => response.json())
      .catch(err => console.error(err));
  }

  return {
    retrieveCollections,
    retrieveNFTs,
    retrieveAsset,
    retrieveContract
  }
}