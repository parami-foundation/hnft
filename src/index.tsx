import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App.tsx';
import { MetaMaskProvider } from 'metamask-react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Wnft } from './pages/Wnft';
import { PfpGeneratorPage } from './pages/PfpGeneratorPage';

ReactDOM.render(
  <React.StrictMode>
    <MetaMaskProvider>
      <BrowserRouter basename="/nft-ring-tool">
        <Routes>
          <Route path="/" element={<App />}>
            <Route path="" element={<Wnft />} />
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
