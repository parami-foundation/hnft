// https://github.com/parami-foundation/parami-erc721h/blob/main/scripts/.deployed/goerli.json

export const EIP5489ForInfluenceMiningContractAddress =
  '0x94F25955e84682BbE5301537f29442Ce1D5b7584'; // goerli

export const AD3ContractAddress = '0xf6b2923717175185a626790FF78B6f37DAbb3565'; // goerli

export const HNFTGovernanceContractAddress =
  '0x7c3826180814518C7d7765b1ECE11eDB708a7850'; // goerli

export const AuctionContractAddress =
  '0x6023cF66B0AD3e79D942c2a66B368C921632D1c2'; // goerli

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
    price: '0',
    description: 'Start earning with a Novel hyperNFT',
  },
  {
    level: 1,
    rank: 'Rare',
    name: 'Rare Billboard',
    price: '100',
    description: 'Rare hyperNFT holders can initiate a group mining',
  },
  {
    level: 2,
    rank: 'Premium',
    name: 'Premium Billboard',
    price: '400',
    description: 'Upgrade to Premium to unlock more features',
  },
  {
    level: 3,
    rank: 'Epic',
    name: 'Epic Billboard',
    price: '1600',
    description: 'Epic hyperNFT makes you a core buidler',
  },
  {
    level: 4,
    rank: 'Legendary',
    name: 'Legendary Billboard',
    price: '6400',
    description: 'The genesis hyperNFT holders are marked as legendary ',
  },
];

export const NETWORK_CONFIG = [
  { id: 'ERC-20', value: 'ERC-20', icon: 'erc.svg' },
  { id: 'ARB-one', value: 'ARB-one', icon: 'arb.svg' },
  { id: 'Optimism', value: 'Optimism', icon: 'optimism.svg' },
  { id: 'BEP-20', value: 'BEP-20', icon: 'bep.svg' },
  { id: 'Solana', value: 'Solana', icon: 'solana.svg' },
];

export enum MINT_NFT_TYPE {
  IMAGE = 'image',
  TWITTER = 'twitter',
}
