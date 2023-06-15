import { useContractEvent } from "wagmi"
import { AuctionContractAddress } from '../models/hnft';
import AuctionContract from '../contracts/Auction.json';

export const useAuctionEvent = (eventName: string, listener: (events: any[]) => void) => {
  const unwatch = useContractEvent({
    address: AuctionContractAddress,
    abi: AuctionContract.abi,
    eventName: eventName,
    listener: listener
  })

  return {
    unwatch,
  }
}