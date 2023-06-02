import { Layout } from 'antd';
import React from 'react';
import { Outlet } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import './App.scss';
import { NavBar } from './components/NavBar';

const { Content, Footer } = Layout;

function App() {
  const { address, isConnected, status } = useAccount();
  console.log(address, status, '---status---');
  return (
    <div className='app'>
      <Layout>
        <NavBar />

        <Content className='content'>
          <Outlet></Outlet>
        </Content>

        <Footer className='footer'>
          {isMobile && status === 'connected' && address ? (
            <div className='mobile-footer'>{`${address.substring(
              0,
              8
            )}...${address.substring(address.length - 6)}`}</div>
          ) : (
            'Made with ❤️ by Parami Foundation'
          )}
        </Footer>
      </Layout>
    </div>
  );
}

export default App;
