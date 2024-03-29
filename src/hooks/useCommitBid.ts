import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi"
import { AuctionContractAddress } from '../models/hnft';
import AuctionContract from '../contracts/Auction.json';

export const useCommitBid = (
  tokenId: number,
  hnftContractAddress: string,
  bidAmount: string,
  slotUri?: string,
  signature?: string,
  curBidId?: string,
  preBidId?: string,
  preBidRemain?: string
) => {
  const { config, error: prepareError } = usePrepareContractWrite({
    address: AuctionContractAddress,
    abi: AuctionContract.abi,
    functionName: 'commitBid',
    args: [[tokenId, hnftContractAddress], bidAmount, slotUri, signature, curBidId, preBidId, preBidRemain]
  });
  const { data, isLoading: writeLoading, write: commitBid, isError, error } = useContractWrite(config);
  const { isLoading: waitTxLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return {
    commitBid,
    isLoading: writeLoading || waitTxLoading,
    isSuccess,
    isError,
    error,
    prepareError
  }
}