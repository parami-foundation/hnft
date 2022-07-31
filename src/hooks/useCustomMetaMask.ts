import { useMetaMask } from "metamask-react";

export function useCustomMetaMask() {
  const metamask = useMetaMask();

  return {
    ...metamask,
    chainId: metamask.chainId ? parseInt(metamask.chainId, 16) : null
  }
}