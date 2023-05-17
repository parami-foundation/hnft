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

  console.log(config, '--config')

  return (
    <>
      <div className='hnft'>
        <div className='title'>my hNFT</div>
        <BillboardNftImage imageUrl={config.image} nftOption={config} />
      </div>
    </>
  );
}
