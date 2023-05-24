const PARAMI_AIRDROP = 'https://staging.parami.io/airdrop';
// const PARAMI_AIRDROP = 'http://localhost:3002';

export interface TwitterUser {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
}

export const requestTwitterOauthUrl = async () => {
  try {
    const resp = await fetch(`${PARAMI_AIRDROP}/request_oauth_token?callbackUrl=${window.origin}`);
    const { oauthUrl } = await resp.json();
    return oauthUrl;
  } catch (error) {
    console.log('request twitter oauth url error', error);
    return null;
  }
}

export const fetchTwitterUser = async (oauth_token: string, oauth_verifier: string) => {
  const data = JSON.stringify({
    oauth_token,
    oauth_verifier
  });

  const resp = await fetch(`${PARAMI_AIRDROP}/twitter/user/info`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: data,
  })

  if (!resp.ok) {
    return null;
  }

  return await resp.json() as TwitterUser;
}
