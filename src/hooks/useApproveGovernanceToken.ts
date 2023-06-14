import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi"
import { AD3ContractAddress, AuctionContractAddress } from "../models/hnft";
import GovernanceToken from '../contracts/HNFTGovernanceToken.json';

export const useApproveGovernanceToken = (address?: `0x${string}`, amount?: string) => {
  const { config, error: prepareError } = usePrepareContractWrite({
    address: address ?? AD3ContractAddress,
    abi: GovernanceToken.abi,
    functionName: 'approve',
    args: [AuctionContractAddress, amount]
  });
  const { data, isLoading: writeLoading, write: approve, isError, error } = useContractWrite(config);
  const { isLoading: waitTxLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return {
    approve,
    isLoading: writeLoading || waitTxLoading,
    isSuccess,
    isError,
    error,
    prepareError
  }
}
