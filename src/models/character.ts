export interface Character {
  avatar: string;
  // author_name?: string;
  // avatar_id?: string;
  // avatar_url: string;
  character_id: string;
  // image_url?: string; // todo: what is this?
  name: string;
  // source: string;
  // twitter_handle: string;
  // voice_id: string;
}

export interface CharacterInfo {
  name: string;
  handle: string;
  id: string;
  avatar: string;
  avatarKey: string;
  background: string;
  tokenIcon: string;
  questions: string[];
}

export interface ChatHistory {
  character_id: string;
  client_message_unicode: string;
  message_id: string;
  platform: string;
  server_message_unicode: string;
  session_id: string;
  timestamp: string;
  user_id: string;
  // other props not listed here
}

// todo: move this to server
export const characters: CharacterInfo[] = [
  {
    name: 'Sam Altman',
    handle: 'sama',
    id: '1',
    avatar: 'https://pbs.twimg.com/profile_images/804990434455887872/BG0Xh7Oa.jpg',
    avatarKey: 'BG0Xh7Oa',
    background: 'https://pbs.twimg.com/profile_images/804990434455887872/BG0Xh7Oa.jpg',
    tokenIcon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    questions: [
      'Why worldcoin?',
      'How many worldcoins do you have?',
      'Which DEX do you prefer?',
    ]
  },
  {
    name: 'Adam Jones',
    handle: 'AdamJonesDAO',
    id: '3',
    avatar: 'https://pbs.twimg.com/profile_images/1580754592052129795/sbX8c7Zk.jpg',
    avatarKey: 'sbX8c7Zk',
    background: 'https://pbs.twimg.com/profile_images/1580754592052129795/sbX8c7Zk.jpg',
    tokenIcon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    questions: [
      'What is your favorite food?',
      'What is your favorite color?',
      'why are you into crypto?',
    ]
  },
  {
    name: 'Elon Musk',
    handle: 'elonmusk',
    id: '4',
    avatar: 'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO.jpg',
    avatarKey: 'yRsRRjGO',
    background: 'https://pbs.twimg.com/media/F1toFHCXoAA7fUK?format=jpg&name=small',
    tokenIcon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    questions: [
      'Are you in love with Mark?',
      'How many bitcoins do you have?',
      'When cage fight?'
    ]
  },
  {
    name: 'Justin Sun',
    handle: 'justinsuntron',
    id: '5',
    avatar: 'https://pbs.twimg.com/profile_images/1490173066357342208/MZyfamFE.jpg',
    avatarKey: 'MZyfamFE',
    background: 'https://pbs.twimg.com/media/F0V34ZLaUAEqltw?format=jpg&name=medium',
    tokenIcon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    questions: [
      'Sir wen moon?',
      'Where are you?',
      'Give me some TRX!'
    ]
  }
];
