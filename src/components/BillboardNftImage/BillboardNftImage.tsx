import React, { CSSProperties } from 'react';
import { ArrowRightOutlined } from '@ant-design/icons';
import cs from 'classnames';
import './BillboardNftImage.scss';
import { useHNFT } from '../../hooks';
import { isMobile } from 'react-device-detect';

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
  const hnft = useHNFT();

  const renderPrice = () => {
    if (nftOption.price === '0') return <>Free</>;

    if (hnft.onWhitelist && nftOption?.rank === 'Rare') {
      return (
        <>
          Free
          {!isMobile && (
            <>
              {nftOption?.rank === 'Rare' && (
                <div className='nft-special-badge'>
                  {hnft.onWhitelist
                    ? 'You are a whitelisted user'
                    : 'Whitelisting is free'}
                </div>
              )}
            </>
          )}
        </>
      );
    }

    return (
      <>
        <img src='/nfts/triangle.svg' alt='' />
        <span>{nftOption?.price}</span>
        {!isMobile && (
          <>
            {nftOption?.rank === 'Rare' && (
              <div className='nft-special-badge'>
                {hnft.onWhitelist
                  ? 'You are a whitelisted user'
                  : 'Whitelisting is free'}
              </div>
            )}
            {nftOption?.rank === 'Legendary' && upgrade && (
              <div className='nft-special-badge'>already superlativ</div>
            )}
          </>
        )}
      </>
    );
  };

  return (
    <>
      <div className={cs('nft-image-container', className)} style={style}>
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

          {isMobile && (
            <>
              {nftOption?.rank === 'Rare' && (
                <span className='nft-special-badge-mobile'>
                  {hnft.onWhitelist
                    ? 'You are a whitelisted user'
                    : 'Whitelisting is free'}
                </span>
              )}

              {nftOption?.rank === 'Legendary' && upgrade && (
                <span className='nft-special-badge-mobile'>
                  already superlative
                </span>
              )}
            </>
          )}

          <div className='price'>{renderPrice()}</div>
          <span className='description'>
            {description || nftOption?.description}
          </span>
        </div>
      </div>
    </>
  );
}
