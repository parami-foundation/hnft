import {
  Button,
  message,
  notification,
  Upload,
  Modal,
  Image as AntdImage,
} from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import './Hnft.scss';

export interface HnftProps {}

export function Hnft(props: HnftProps) {
  return (
    <>
      <div className='my-hnft'>
        <div className='title'>my hNFT</div>
      </div>
    </>
  );
}
