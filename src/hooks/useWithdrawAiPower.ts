import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi"
import AuctionContract from '../contracts/Auction.json';
import { WithdrawSignature } from "../services/relayer.service";

export const useWithdrawAiPower = (withdrawSig?: WithdrawSignature, contractAddress?: `0x${string}`) => {
  const { config, error: prepareError } = usePrepareContractWrite({
    address: contractAddress,
    abi: AuctionContract.abi, // todo: contract abi
    functionName: 'withdrawToken',
    args: [withdrawSig?.token_contract, withdrawSig?.to, withdrawSig?.amount, withdrawSig?.nonce, withdrawSig?.sig]
  });
  const { data, isLoading: writeLoading, write: withdrawPower, isError, error } = useContractWrite(config);
  const { isLoading: waitTxLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return {
    withdrawPower,
    isLoading: writeLoading || waitTxLoading,
    isSuccess,
    isError,
    error,
    prepareError
  }
}