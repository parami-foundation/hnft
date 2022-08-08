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
  4: 'Rinkeby Testnet'
}

export const LegacyRegistryContractAddress = {
  1: '0x0833624A59E827203965bC1eb866eEe1B2D2E49B',
  4: '0xc0981bf737f5d4e1af738133b787693b17aa7dce'
}

export const RegistryContractAddress = {
  1: '0xecAb9043EEaf6CD621519c19D7E250fD2a056bFf',
  4: '0x3bd1D1D8bA3c4bB19dAA4139C5e13e807d957bCE'
}

export const HNFTCollectionContractAddress = {
  1: '0x27783a7efe772338245890331d9519016958bee5',
  4: '0x7fd8bc0e6a47f4cccee666fc09267ca142069ef9'
}

export const ParamiLinkContractAddress = {
  1: '0xEC5ecECBd5375575503130ce6a01166eC875FEcD',
  4: '0xC6BfB27A439c792Cb919B923305b5f927DA8B58F'
}
