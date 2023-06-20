import { PARAMI_AIRDROP } from "../models/hnft";
import { fetchWithAuthorization } from "../utils/api.util";

export interface AccountWallet {
  user_id: number;
  chain_id: number;
  wallet: string;
}

export interface Account {
  id: number;
  ad3_balance: string;
  dao_applicable: boolean;
  hnft_contract_addr: string;
  hnft_token_id: string;
  wallets: AccountWallet[];
}

export interface RewardTokenBalance {
  id?: number;
  user_id: number;
  hnft_contract_addr: string;
  hnft_token_id: number;
  governance_token_contract: string;
  balance: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface GovernanceTokenRewardTxn {
  id: string;
  user_id: number;
  diff: bigint;
  withdraw_nonce: bigint;
  governance_token_contract: string;
  hnft_token_id: number;
  chain_id: number;
  nonce: bigint;
  wallet: string;
  created_time: string;
}

export interface WithdrawSignature {
  token_contract: string;
  to: string;
  amount: string;
  nonce: string;
  sig: string;
}

export const createAccountOrLogin = async (ticket: string) => {
  const data = JSON.stringify({
    type: 'twitter',
    ticket
  });

  const resp = await fetch(`${PARAMI_AIRDROP}/relayer/api/user`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: data,
  })

  if (resp.ok) {
    const token = await resp.json() as string;
    window.localStorage.setItem('authorization', `Bearer ${token}`);

    return {
      success: true
    }
  }

  const { message } = await resp.json() as { message: string };
  return {
    success: false,
    status: resp.status,
    message,
  }
}

export const getTwitterOauthUrl = async (state?: string) => {
  try {
    const resp = await fetch(`${PARAMI_AIRDROP}/relayer/api/twitter/login?state=${state ?? 'relayerSignin'}`);
    return await resp.json();
  } catch (e) {
    console.log('request_oauth_token error', e);
    return;
  }
}

export const getAccount = async () => {
  try {
    const resp = await fetchWithAuthorization(`${PARAMI_AIRDROP}/relayer/api/user`);
    if (!resp) {
      return;
    }
    return await resp.json() as Account;
  } catch (e) {
    console.log('get account error', e);
    return;
  }
}

export const bindWallet = async (wallet: string, chainId: number, message: string, signature: string) => {
  try {
    const postBody = JSON.stringify({
      type: 'wallet',
      wallet,
      chainId,
      message,
      signature
    });
    const resp = await fetchWithAuthorization(`${PARAMI_AIRDROP}/relayer/api/user/bind`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: postBody,
    })

    if (resp?.ok) {
      return {
        success: true
      }
    }
    return {
      success: false,
      message: await resp?.json()
    }
  } catch (e) {
    console.log('bind wallet error', e);
    return { success: false }
  }
}

export const getRewardTokenBalances = async () => {
  try {
    const resp = await fetchWithAuthorization(`${PARAMI_AIRDROP}/relayer/api/user/balances`);
    if (!resp) {
      return null;
    }
    return await resp.json() as RewardTokenBalance[];
  } catch (e) {
    console.log('fetch reward token balances error', e);
    return null;
  }
}

export const claimToken = async (bidId: string) => {
  const data = {
    bidId,
  }

  const resp = await fetchWithAuthorization(`${PARAMI_AIRDROP}/relayer/api/viewer/claim_ad_reward`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  })

  if (!resp) {
    return null;
  }

  if (resp.ok) {
    return {
      success: true,
    }
  }

  return await resp.json();
}

export const getWithdrawTxns = async () => {
  const resp = await fetchWithAuthorization(`${PARAMI_AIRDROP}/relayer/api/reward/transactions`);
  if (!resp) {
    return null;
  }
  const txns = await resp.json() as GovernanceTokenRewardTxn[];
  return txns.filter(tx => Number(tx.diff) < 0);
}

export const withdrawGovernanceTokenReward = async (hnft_id: number, chain_id: number, amount: string, governance_token_contract: string) => {
  const data = {
    hnft_id,
    amount,
    chain_id,
    governance_token_contract
  }

  const resp = await fetchWithAuthorization(`${PARAMI_AIRDROP}/relayer/api/reward/withdrawal`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  })

  if (!resp) {
    return null;
  }

  return await resp.json() as WithdrawSignature;
}

export const getWithdrawSigOfTxn = async (txnId: string) => {
  const data = {
    txn_id: txnId,
  }

  const resp = await fetchWithAuthorization(`${PARAMI_AIRDROP}/relayer/api/reward/transaction_signature`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  })

  if (!resp) {
    return null;
  }

  return await resp.json() as WithdrawSignature;
}
