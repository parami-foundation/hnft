import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, HashRouter } from 'react-router-dom';
import {
  EthereumClient,
  w3mConnectors,
} from '@web3modal/ethereum';
import { publicProvider } from 'wagmi/providers/public';
import { Web3Modal } from '@web3modal/react';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { infuraProvider } from 'wagmi/providers/infura';
import { goerli } from 'wagmi/chains';
import { MyHNFT } from './pages/MyHNFT';
import { IssueToken } from './pages/IssueToken';
import BidHNFT from './pages/BidHNTF/BidHNFT';
import App from './App.tsx';
import './index.scss';
import Reward from './pages/Reward/Reward';
import ClaimAd from './pages/ClaimAd/ClaimAd';
import Withdraws from './pages/Withdraws/Withdraws';
import Chatbot from './pages/Chatbot/Chatbot.tsx';

const projectId = '2e586b0807500a0da3a4f7b66418295e';
const INFURA_API_KEY = '46cdd1b1481049b992a90914cc17b52f';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [goerli],
  [infuraProvider({ apiKey: INFURA_API_KEY }), publicProvider()]
);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    ...w3mConnectors({ projectId, version: 1, chains }),
  ],
  publicClient,
  webSocketPublicClient,
});

const ethereumClient = new EthereumClient(wagmiConfig, chains);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <>
    <WagmiConfig config={wagmiConfig}>
      <HashRouter>
        <Routes>
          <Route path='/' element={<App />}>
            <Route path='' element={<MyHNFT />} />
            <Route path='/issue' element={<IssueToken />} />
            <Route path='/bid' element={<BidHNFT />} />
            <Route path='/reward' element={<Reward />} />
            <Route path='/reward/withdraws' element={<Withdraws />} />
            <Route path='/claim' element={<ClaimAd />} />
            
            <Route path='/chatbot' element={<Chatbot />} />

            <Route path='*' element={<Navigate to='/' />} />
          </Route>
        </Routes>
      </HashRouter>
    </WagmiConfig>

    <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
  </>
);
