import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App.tsx';
import { MetaMaskProvider } from 'metamask-react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Wnft } from './pages/Wnft';
import { Hnft } from './pages/Hnft';
import { MyNFTs } from './pages/MyNFTs';

ReactDOM.render(
  <React.StrictMode>
    <MetaMaskProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route path="" element={<MyNFTs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MetaMaskProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
