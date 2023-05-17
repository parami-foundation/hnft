export const BillboardLevel2MiningPower: { [level: string]: number } = {
  '0': 20,
  '1': 50,
  '2': 100,
  '3': 200,
  '4': 400,
};

export const BillboardLevel2Name: { [level: string]: string } = {
  '0': 'Novel',
  '1': 'Rare',
  '2': 'Premium',
  '3': 'Epic',
  '4': 'Legendary',
};

export const HNFT_CONFIG = [
  {
    level: 0,
    rank: 'Novel',
    name: 'Novel Billboard',
    boost: 'X2',
    price: '0',
    description: 'Start earning with a Novel hyperNFT',
  },
  {
    level: 1,
    rank: 'Rare',
    name: 'Rare Billboard',
    boost: 'X5',
    price: '100',
    description: 'Rare hyperNFT holders can initiate a group mining',
  },
  {
    level: 2,
    rank: 'Premium',
    name: 'Premium Billboard',
    boost: 'X10',
    price: '400',
    description: 'Upgrade to Premium to unlock more features',
  },
  {
    level: 3,
    rank: 'Epic',
    name: 'Epic Billboard',
    boost: 'X20',
    price: '1600',
    description: 'Epic hyperNFT makes you a core buidler',
  },
  {
    level: 4,
    rank: 'Legendary',
    name: 'Legendary Billboard',
    boost: 'X40',
    price: '6400',
    description: 'The genesis hyperNFT holders are marked as legendary ',
  },
];
