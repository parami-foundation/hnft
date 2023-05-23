import { Layout, Button } from 'antd';
import React from 'react';
import { Outlet } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import { useCustomMetaMask } from './hooks/useCustomMetaMask';
import './App.scss';
import { NavBar } from './components/NavBar';

const { Content, Footer } = Layout;

function App() {
  const { account, status } = useCustomMetaMask();
  return (
    <div className='app'>
      <Layout>
        <NavBar />

        <Content className='content'>
          <Outlet></Outlet>
        </Content>

        <Footer className='footer'>
          {isMobile && status === 'connected' && account ? (
            <div className='mobile-footer'>{`${account.substring(0, 8)}...${account.substring(
              account.length - 6
            )}`}</div>
          ) : (
            'Made with ❤️ by Parami Foundation'
          )}
        </Footer>
      </Layout>
    </div>
  );
}

export default App;
