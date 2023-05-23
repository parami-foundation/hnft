import React, { useState, useRef } from 'react';
import { isMobile } from 'react-device-detect';
import cs from 'classnames';
import { Button } from 'antd'
import { BillboardNftImage } from '../../components/BillboardNftImage';
import { CreateHnftModal } from '../../components/CreateHnftModal';
import { useAD3Balance, HNFT, useHNFT } from '../../hooks';
import { BillboardLevel2Name } from '../../models/hnft';
import MintSuccess from '../../components/MintSuccess/MintSuccess';
import './Hnft.scss';

export interface HnftProps {
  config: HNFT;
}

export function Hnft(props: HnftProps) {
  const { config } = props;
  const [visible, setVisible] = useState(false);
  const mintSuccessRef = useRef<HTMLDivElement>() as any;
  const { hnft } = useHNFT();
  const blance = useAD3Balance();

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
            className={cs(
              `billboard-nft-${hnft?.rank}`,
              isMobile && 'mobile-billboard-nft-image'
            )}
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
                <img src='/nfts/triangle.svg' alt='' />
              </div>
              <div>
                <div>$ AD3</div>
                <div className='token-type'>Ethrteum</div>
              </div>
            </div>
            <div className='token-price'>{blance}</div>
          </div>
        </div>
        {isMobile && (
          <div className='issue-my-first-token token'>
            <Button>Issue my first token</Button>
          </div>
        )}
      </div>
      {visible && (
        <CreateHnftModal
          upgrade
          onCreate={onCreateSuccess}
          onCancel={() => setVisible(false)}
        />
      )}
      <MintSuccess ref={mintSuccessRef} />
    </>
  );
}
