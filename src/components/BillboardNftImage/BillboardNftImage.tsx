import React, { CSSProperties } from 'react';
import { ArrowRightOutlined } from '@ant-design/icons';
import cs from 'classnames';
import './BillboardNftImage.scss';

export interface BillboardNftImageProps {
  imageUrl?: string;
  level?: number;
  nftOption?: any;
  description?: string;
  upgrade?: boolean;
  style?: CSSProperties;
  className?: string;
  onUpgrade?: () => void;
}

export function BillboardNftImage({
  imageUrl,
  nftOption,
  description,
  upgrade = false,
  style,
  className,
  onUpgrade,
}: BillboardNftImageProps) {
  return (
    <>
      <div
        className={cs(
          'nft-image-container',
          className,
        )}
        style={style}
      >
        <div className='svg-container'>
          <img
            className='nft-image'
            src={imageUrl || nftOption?.image}
            alt=''
            referrerPolicy='no-referrer'
          />
          <div className='nft-badge-container'>
            <img src={`/nfts/badge-level-${nftOption?.level}.svg`} alt='' />
          </div>
        </div>
        <div className='nft-description'>
          <div className='rank'>
            <span>{nftOption?.rank}</span>
            {upgrade && nftOption?.rank !== 'Legendary' && (
              <div className='upgrade' onClick={onUpgrade}>
                <span>Can be upgraded</span>
                <ArrowRightOutlined />
              </div>
            )}
          </div>
          <div className='price'>
            {nftOption?.price === '0' && <>Free</>}
            {nftOption?.price !== '0' && (
              <>
                <img src='/nfts/triangle.svg' alt='' />
                <span>{nftOption?.price}</span>
              </>
            )}
          </div>
          <span className='description'>
            {description || nftOption?.description}
          </span>
        </div>
      </div>
    </>
  );
}
