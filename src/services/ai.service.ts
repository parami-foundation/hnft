import { Character, ChatHistory } from "../models/character";
import { PARAMI_AI, PARAMI_AIRDROP } from "../models/hnft";

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
