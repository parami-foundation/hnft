import { PARAMI_AIRDROP } from "../models/hnft";

export const chatWithSocialAgent = async (kolId: string, message: string) => {
  try {
    const postBody = JSON.stringify({
      userId: '1',
      kolId,
      message
    });
    const resp = await fetch(`${PARAMI_AIRDROP}/socialagent/api/chat`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: postBody
    })
    if (!resp.ok) {
      return {
        success: false,
      };
    }

    const respMessage = await resp.json() as string;
    return {
      success: true,
      message: respMessage
    };
  } catch (e) {
    console.log('chat error', e);
    return {
      success: false,
    };
  }
}