import { PARAMI_AIRDROP } from "../models/hnft";
import { fetchWithAuthorization } from "../utils/api.util";

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
    return await resp.json();
  } catch (e) {
    console.log('get account error', e);
    return;
  }
}
