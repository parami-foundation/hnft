import React, { useState } from 'react';
import { BillboardNftImage } from '../../components/BillboardNftImage';
import { HNFT } from '../../hooks/useHNFT';
import { CreateHnftModal } from '../../components/CreateHnftModal';
import './Hnft.scss';

export interface HnftProps {
  config: HNFT;
}

export function Hnft(props: HnftProps) {
  const { config } = props;
  const [visible, setVisible] = useState(false)

  const onCreateNewHNFT = () => {
    
  }

  return (
    <>
      <div className='hnft'>
        <div className='my-hnft'>
          <div className='title'>my hNFT</div>
          <BillboardNftImage
            upgrade
            nftOption={config}
            style={{ flexDirection: 'column', padding: 0 }}
            description='Upgrade to Premium to unlock more features'
            onUpgrade={() => setVisible(true)}
          />
        </div>
        <div className='my-token'>
          <div className='title'>my Token</div>
          <div className='token'>
            <div className='token-detail'>
              <div className='token-image'>
                <img src='./images/logo_black.png' alt='' />
              </div>
              <div>
                <div>$ AD3</div>
                <div className='token-type'>Ethrteum</div>
              </div>
            </div>
            <div className='token-price'>1234</div>
          </div>
        </div>
      </div>
      {visible && (
        <CreateHnftModal
          upgrade
          onCreate={onCreateNewHNFT}
          onCancel={() => setVisible(false)}
        />
      )}
    </>
  );
}
