import {
  Button,
  message,
  notification,
  Upload,
  Modal,
  Image as AntdImage,
} from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { BillboardNftImage } from '../../components/BillboardNftImage';
import { HNFT } from '../../hooks/useHNFT';
import './Hnft.scss';

export interface HnftProps {
  config: HNFT;
}

export function Hnft(props: HnftProps) {
  const { config } = props;

  return (
    <>
      <div className='hnft'>
        <div className='my-hnft'>
          <div className='title'>my hNFT</div>
          <BillboardNftImage imageUrl={config.image} nftOption={config} />
        </div>
        <div className='my-token'>
          <div className='title'>my Token</div>
          <div className='token'></div>
        </div>
      </div>
    </>
  );
}
