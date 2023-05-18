import { Button, Modal } from 'antd';
import React from 'react';
import { BillboardNftImage } from '../BillboardNftImage';
import { HNFT } from '../../hooks/useHNFT';
import './MintSuccess.scss';

export function MintSuccess({ hnft }: { hnft: HNFT }) {
  return (
    <>
      <Modal
        centered
        open
        width={596}
        closable={false}
        wrapClassName='mint-success'
        footer={null}
      >
        <div className='mint-success-container'>
          <div className='success-info'>
            <div style={{ position: 'absolute' }}>
              <img src='./images/mint_background.png' alt='' />
            </div>
            <div className='title'>you're done</div>
            <BillboardNftImage
              className='mint-success-hnft'
              nftOption={hnft}
              style={{ flexDirection: 'column', padding: 0 }}
            />
          </div>
          <div className='view-assets'>
            <Button>view assets</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
