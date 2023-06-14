import { PARAMI_AIRDROP } from "../models/hnft";
import { fetchWithAuthorization, fetchWithCredentials } from "../utils/api.util";

export interface BidWithSignature {
  id: string;
  ad_id: number;
  bidder_id: number;
  prev_bid_id: string;
  hnft_contract: string;
  hnft_token_id: number;
  governance_token_contract: string;
  governance_token_amount: bigint;
  governance_token_remain?: bigint;
  active?: boolean;
  updated_at?: Date;

  sig: string;
  last_bid_remain: string;
};

export const createBid = async (adId: number, hnftContractAddress: string, tokenId: number, governanceTokenAmount: string) => {
  try {
    const data = JSON.stringify({
      bidder_id: '1', // todo: remove bidder_id
      ad_id: adId,
      hnft_contract: hnftContractAddress,
      hnft_token_id: tokenId,
      governance_token_amount: governanceTokenAmount,
      flag: 1
    });

    const resp = await fetchWithAuthorization(`${PARAMI_AIRDROP}/relayer/api/advertiser/auction/bid`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: data
    })

    if (!resp) {
      return;
    }

    const bidWithSig = await resp.json() as BidWithSignature;
    return bidWithSig;
  } catch (e) {
    console.log('create bid error', e);
    return;
  }
}

export interface CreateAdMetaInfo {
  meta_ipfs_uri: string;
  reward_rate_in_100_percent: number;
  payout_base: number;
  payout_min: number;
  payout_max: number;
  tags: string[];
}

export const createAdMeta = async (createAdMetaInfo: CreateAdMetaInfo) => {
  try {
    const postBody = JSON.stringify(createAdMetaInfo);
    const resp = await fetchWithAuthorization(`${PARAMI_AIRDROP}/relayer/api/ad_meta/create`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: postBody
    })

    if (!resp) {
      return;
    }

    const adMetaId = await resp.json() as number;
    return adMetaId;
  } catch (e) {
    console.log('create ad meta error', e);
    return;
  }
}
