import { Character, ChatHistory } from "../models/character";
import { PARAMI_AI, PARAMI_AIRDROP } from "../models/hnft";

// mock api
const mock = true;

export interface PowerReward {
  id: string;
  user_id: string;
  token_icon: string;
  token_name: string;
  token_symbol: string;
  contract_addr: string;
  amount: string;
}

export interface WithdrawSignature {
  token_contract: string;
  to: string;
  amount: string;
  nonce: string;
  sig: string;
}

export const getCharaters = async () => {
  const resp = await fetch(`${PARAMI_AI}/characters`);
  const characters = await resp.json();
  return characters;
}

export const queryCharacter = async (query: {avatar_url?: string, twitter_handle?: string}) => {
  if (!query || (!query.avatar_url && !query.twitter_handle)) {
    return null;
  }

  const resp = await fetch(`${PARAMI_AI}/character?${new URLSearchParams(query)}`);
  const character = await resp.json() as Character;
  return character;
}

export const getChatHistory = async (token: string, characterId: string) => {
  const resp = await fetch(`${PARAMI_AI}/character_history?character_id=${characterId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const history = await resp.json() as ChatHistory[];
  return history;
}

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

export const getAudioOfText = async (text: string) => {
  const postBody = JSON.stringify({
    text
  });

  const resp = await fetch(`${PARAMI_AIRDROP}/socialagent/api/tts`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: postBody
  });
  const audioData = await resp.arrayBuffer();
  return audioData;
}

export const getAgentInfo = async (agentId: string) => {
  const resp = await fetch(`${PARAMI_AIRDROP}/socialagent/api/agentInfo/${agentId}`);
  const agentInfo = await resp.json();
  return agentInfo;
}

export const getPowerRewards = async (token: string) => {
  if (mock) {
    return [
      {
        id: '123',
        user_id: '',
        token_icon: 'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO.jpg',
        token_name: 'Elon Musk AI Power',
        token_symbol: '$MUSK',
        amount: '10000000000000000'
      }
    ] as PowerReward[];
  }
  const resp = await fetch(`${PARAMI_AI}/power_rewards`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const rewards = await resp.json() as PowerReward[];
  return rewards;
}

export const getPowerRewardWithdrawSig = async (token: string, rewardId: string) => {
  const resp = await fetch(`${PARAMI_AI}/power_withdraw_sig?id=${rewardId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const sig = await resp.json() as WithdrawSignature;
  return sig;
}
