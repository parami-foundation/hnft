import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi"
import AuctionContract from '../contracts/Auction.json';

export const useAiAdBid = (
  contractAddress?: `0x${string}`,
  description?: string,
  link?: string,
) => {
  const { config, error: prepareError } = usePrepareContractWrite({
    address: contractAddress,
    abi: AuctionContract.abi, // todo: contract abi
    functionName: 'bid',
    args: [description, link]
  });
  const { data, isLoading: writeLoading, write: bidAd, isError, error } = useContractWrite(config);
  const { isLoading: waitTxLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return {
    bidAd,
    isLoading: writeLoading || waitTxLoading,
    isSuccess,
    isError,
    error,
    prepareError
  }
}