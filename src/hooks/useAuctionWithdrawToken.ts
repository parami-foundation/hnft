import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi"
import { AuctionContractAddress } from '../models/hnft';
import AuctionContract from '../contracts/Auction.json';
import { WithdrawSignature } from "../services/relayer.service";

export const useAuctionWithdrawToken = (withdrawSig?: WithdrawSignature) => {
  const { config, error: prepareError } = usePrepareContractWrite({
    address: AuctionContractAddress,
    abi: AuctionContract.abi,
    functionName: 'withdrawGovernanceToken',
    args: [withdrawSig?.token_contract, withdrawSig?.to, withdrawSig?.amount, withdrawSig?.nonce, withdrawSig?.sig]
  });
  const { data, isLoading: writeLoading, write: withdrawToken, isError, error } = useContractWrite(config);
  const { isLoading: waitTxLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return {
    withdrawToken,
    isLoading: writeLoading || waitTxLoading,
    isSuccess,
    isError,
    error,
    prepareError
  }
}