import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
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
            {/* <Route path="" element={<Wnft />} /> */}
            {/* <Route path="hnft" element={<Hnft />} /> */}

            {/* <Route path="pfp" element={<PfpGeneratorPage />} /> */}

            {/* <Route
              path=""
              element={<Navigate to="wnft" replace />}
            /> */}
          </Route>
        </Routes>
      </BrowserRouter>
    </MetaMaskProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
