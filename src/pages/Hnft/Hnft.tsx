import React, { useState, useRef, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import cs from 'classnames';
import { Button, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { BillboardNftImage } from '../../components/BillboardNftImage';
import { CreateHnftModal } from '../../components/CreateHnftModal';
import { HNFT, useHNFT } from '../../hooks';
import { AuctionContractAddress, BillboardLevel2Name } from '../../models/hnft';
import MintSuccess from '../../components/MintSuccess/MintSuccess';
import './Hnft.scss';
import { useHnftGovernanceToken } from '../../hooks/useHnftGovernanceToken';
import { amountToFloatString } from '../../utils/format.util';
import { useAuthorizeSlotTo } from '../../hooks/useAuthorizeSlotTo';

export interface HnftProps {
  config: HNFT;
}

export function Hnft(props: HnftProps) {
  const { config } = props;
  const [visible, setVisible] = useState(false);
  const mintSuccessRef = useRef<HTMLDivElement>() as any;
  const hnft = useHNFT();
  const navigate = useNavigate();

  const { currentSlotManager, authorizeSlotTo, isSuccess } = useAuthorizeSlotTo(Number(hnft.tokenId), AuctionContractAddress);

  useEffect(() => {
    if (isSuccess) {
      notification.success({
        message: 'Authorize hNFT slot success'
      })
    }
  }, [isSuccess])

  const onCreateSuccess = () => {
    setVisible(false);
    mintSuccessRef?.current?.onCreateSuccess();
  };

  const governanceToken = useHnftGovernanceToken(hnft.address, hnft.tokenId);

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
            description={`Upgrade to ${BillboardLevel2Name[Number(config?.level) + 1]
              } to unlock more features`}
            onUpgrade={() => setVisible(true)}
          />
          {currentSlotManager !== AuctionContractAddress && <>
            <div className='auth-btn-container'>
              <Button type='primary' onClick={() => {
                authorizeSlotTo?.();
              }}>Authorize</Button>
            </div>
          </>}
        </div>
        <div className='my-token'>
          <div className='title'>My Token</div>
          <div className='token'>
            <div className='token-detail'>
              <div className='token-image'>
                <img src='/nfts/triangle.svg' alt='' />
              </div>
              <div>
                <div>$ {governanceToken.symbol}</div>
                <div className='token-type'>Ethereum</div>
              </div>
            </div>
            <div className='token-price'>
              {Number(Number(amountToFloatString(governanceToken.balance ?? '0', governanceToken.decimals)).toFixed(4)).toLocaleString('en-US')}
            </div>
          </div>
        </div>
        {governanceToken.isAD3 && (
          <div className='issue-my-first-token token'>
            <Button onClick={() => navigate('/issue')} type="primary">Issue my token</Button>
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
