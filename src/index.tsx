import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from '@web3modal/ethereum';
import { publicProvider } from 'wagmi/providers/public';
import { Web3Modal } from '@web3modal/react';
import { MetaMaskProvider } from 'metamask-react';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { goerli } from 'wagmi/chains';
import { MyHNFT } from './pages/MyHNFT';
import { IssueToken } from './pages/IssueToken';
import App from './App.tsx';
import './index.scss';


const projectId = '2e586b0807500a0da3a4f7b66418295e';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [goerli],
  [publicProvider()]
);

const wagmiConfig = createConfig({
  autoConnect: true,
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
      <MetaMaskProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<App />}>
              <Route path='' element={<MyHNFT />} />
              <Route path='/issue' element={<IssueToken />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </MetaMaskProvider>
    </WagmiConfig>

    <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
  </>
);
