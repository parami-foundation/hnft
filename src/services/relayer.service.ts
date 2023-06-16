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

export const claimToken = async (bidId: string, tags: string[]) => {
  const data = {
    bidId,
    tags,
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
