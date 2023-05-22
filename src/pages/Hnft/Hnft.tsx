import React, { useState, useRef } from 'react';
import { BillboardNftImage } from '../../components/BillboardNftImage';
import { HNFT, useHNFT } from '../../hooks/useHNFT';
import { CreateHnftModal } from '../../components/CreateHnftModal';
import { useHNFTGovernance } from '../../hooks/useHNFTGovernance';
import { BillboardLevel2Name } from '../../models/hnft';
import MintSuccess from '../../components/MintSuccess/MintSuccess';
import './Hnft.scss';

export interface HnftProps {
  config: HNFT;
}

export function Hnft(props: HnftProps) {
  const { config } = props;
  const [visible, setVisible] = useState(false);
  const { hnft } = useHNFT();
  const token = useHNFTGovernance(hnft!);
  const mintSuccessRef = useRef<HTMLDivElement>() as any;

  const onCreateSuccess = () => {
    setVisible(false);
    mintSuccessRef?.current?.onCreateSuccess();
  };

  return (
    <>
      <div className='hnft'>
        <div className='my-hnft'>
          <div className='title'>my hNFT</div>
          <BillboardNftImage
            upgrade
            nftOption={config}
            style={{ flexDirection: 'column', padding: 0 }}
            description={`Upgrade to ${
              BillboardLevel2Name[Number(config?.level) + 1]
            } to unlock more features`}
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
            <div className='token-price'>{token}</div>
          </div>
        </div>
      </div>
      {visible && (
        <CreateHnftModal
          upgrade
          onCreate={onCreateSuccess}
          onCancel={() => setVisible(false)}
        />
      )}
      <MintSuccess hnft={hnft!} ref={mintSuccessRef} />
    </>
  );
}
