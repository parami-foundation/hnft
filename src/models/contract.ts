export const networks = {
  mainnet: "0x1", // 1
  // Test nets
  goerli: "0x5", // 5
  ropsten: "0x3", // 3
  rinkeby: "0x4", // 4
  kovan: "0x2a", // 42
  mumbai: "0x13881", // 80001
  // Layers 2
  arbitrum: "0xa4b1", // 42161
  optimism: "0xa", // 10
  // Side chains
  polygon: "0x89", // 137
  gnosisChain: "0x64", // 100
  // Alt layer 1
  binanceSmartChain: "0x38", // 56
  avalanche: "0xa86a", // 43114
  cronos: "0x19", // 25
  fantom: "0xfa" // 250
}

export const SupportedNetworkName: {[id: number]: string} = {
  1: 'Mainnet',
  5: 'Goerli Testnet'
}

export const LegacyRegistryContractAddress = {
  1: '0x0833624A59E827203965bC1eb866eEe1B2D2E49B',
  4: '0xc0981bf737f5d4e1af738133b787693b17aa7dce'
}

export const RegistryContractAddress = {
  1: '0x2da9d0F4D3F2790B0bB6798dE58788e3bf13646D',
  4: '0xAe3F861851Fa7BDD04A8cba2ceB46eCB64c68785'
}

export const HNFTCollectionContractAddress: Record<number, string> = {
  1: '0xfc8db4bc2a48251a921b3ee1392bbded858cc86e',
  5: '0x94F25955e84682BbE5301537f29442Ce1D5b7584',
};

export const AD3ContractAddress: Record<number, string> = {
  1: '0xfc8db4bc2a48251a921b3ee1392bbded858cc86e',
  5: '0xf6b2923717175185a626790FF78B6f37DAbb3565',
};

export const ParamiLinkContractAddress = {
  1: '0x7A585595490328503eb3609723B0B16Eb0373013',
  4: '0x75EE8Ce53Bd26C21405Def16Dd416C90054E7146'
}
