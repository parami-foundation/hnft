import { HNFTGovernanceContractAddress } from "../models/hnft";
import Governance from '../contracts/HNFTGovernance.json';
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi';

export const useIssueGovernanceToken = (hnftAddress?: string, nftId?: string, name?: string, symbol?: string) => {
  const { config, error: prepareError } = usePrepareContractWrite({
    address: HNFTGovernanceContractAddress,
    abi: Governance.abi,
    functionName: 'issueGovernanceToken',
    args: [hnftAddress, nftId, name, symbol]
  });

  const { data, isLoading: writeLoading, write: issueToken, isError, error } = useContractWrite(config);
  const { isLoading: waitTxLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return {
    issueToken,
    isLoading: writeLoading || waitTxLoading,
    isSuccess,
    isError,
    error,
    prepareError
  }
}