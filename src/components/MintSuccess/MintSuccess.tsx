import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Button, Modal } from 'antd';
import type { FC } from 'react';
import { isMobile } from 'react-device-detect';
import { useNavigate } from 'react-router-dom';
import { BillboardNftImage } from '../BillboardNftImage';
import MobileDrawer from '../MobileDrawer/MobileDrawer';
import { useHNFT } from '../../hooks';
import './MintSuccess.scss';

const MintSuccess: FC<{ ref: any }> = forwardRef((props, ref) => {
  const hnft = useHNFT();
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  const onCreateSuccess = () => {
    setVisible(true);
  };

  const onViewAssets = () => {
    setVisible(false);
  };

  useImperativeHandle(ref, () => ({
    onCreateSuccess,
  }));

  const renderMintSuccess = () => (
    <div className='mint-success-container'>
      <div className='success-info'>
        <div style={{ position: 'absolute' }}>
          <img src='./images/mint_background.png' alt='' />
        </div>
        <div className='title'>you're done</div>
        <BillboardNftImage
          nftOption={hnft}
          className='mint-success-hnft'
          style={{ flexDirection: 'column', padding: 0 }}
        />
      </div>
      <div className='view-assets' onClick={onViewAssets}>
        <Button onClick={() => navigate('/issue')}>authorization</Button>
      </div>
    </div>
  );

  return (
    <>
      {isMobile && (
        <>
          <MobileDrawer closable={true} open={visible}>
            {renderMintSuccess()}
          </MobileDrawer>
        </>
      )}
      {!isMobile && (
        <Modal
          centered
          width={596}
          closable={false}
          wrapClassName='mint-success'
          footer={null}
          open={visible}
        >
          {renderMintSuccess()}
        </Modal>
      )}
    </>
  );
});

export default MintSuccess;
