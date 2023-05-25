import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { MetaMaskProvider } from 'metamask-react';
import { BrowserRouter, Routes, Route, HashRouter } from 'react-router-dom';
import { MyHNFT } from './pages/MyHNFT';
import { IssueToken } from './pages/IssueToken';
import './index.scss';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <>
    <React.StrictMode>
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
    </React.StrictMode>
  </>
);
