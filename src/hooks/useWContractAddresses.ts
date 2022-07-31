import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { LegacyRegistryContractAddress, RegistryContractAddress } from "../models/contract";
import { useCustomMetaMask } from "./useCustomMetaMask";
import ERC721Registry from '../ERC721WRegistry.json';

export function useWContractAddresses() {
  const { chainId, ethereum } = useCustomMetaMask();
  const [addresses, setAddresses] = useState<string[]>();

  const fetchWAddresses = async (registryContracts: ethers.Contract[]) => {
    const addresses = await Promise.all(registryContracts.map(contract => {
      return contract.getWrappedContracts().then((wrapped: string[]) => {
        return Promise.all(wrapped.map(addr => contract.getERC721wAddressFor(addr)))
      }).catch((e: any) => {
        console.error('fetchWAddresses error', e);
        return [];
      });
    })).then(arrayOfAddresses => arrayOfAddresses.flat()).catch((e) => {
      console.error('fetchWAddresses error', e);
      return [];
    });
    setAddresses(addresses.map(addr => addr.toLowerCase()));
  }

  useEffect(() => {
    if ((chainId === 1 || chainId === 4) && ethereum) {
      const legacyRegistryContract = new ethers.Contract(
        LegacyRegistryContractAddress[chainId],
        ERC721Registry.abi,
        new ethers.providers.Web3Provider(ethereum)
      );

      const registryContract = new ethers.Contract(
        RegistryContractAddress[chainId],
        ERC721Registry.abi,
        new ethers.providers.Web3Provider(ethereum)
      );

      fetchWAddresses([legacyRegistryContract, registryContract]);
    }
  }, [chainId, ethereum])

  return addresses;
}