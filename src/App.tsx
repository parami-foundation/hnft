import { Layout } from 'antd';
import React from 'react';
import { Outlet } from 'react-router-dom';
import './App.scss';
import { NavBar } from './components/NavBar';
import { Bit, BitArray, bs58ToHex, parse, write } from './utils';

const { Content, Footer } = Layout;

function App() {
  return (
    <div className='app'>
      <Layout>
        <NavBar />

        <Content className='content'>
          <Outlet></Outlet>
        </Content>

        <Footer className='footer'>Made with ❤️ by Parami Foundation</Footer>
      </Layout>
    </div>
  );
}

export default App;
