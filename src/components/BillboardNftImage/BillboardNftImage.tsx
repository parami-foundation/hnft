import React from 'react';
import './BillboardNftImage.scss';

export interface BillboardNftImageProps {
  imageUrl: string;
  level?: number;
  active?: boolean;
  selected?: boolean;
  nftOption?: any;
}

export function BillboardNftImage({
  imageUrl,
  active,
  selected,
  nftOption,
}: BillboardNftImageProps) {
  return (
    <>
      <div
        className={`nft-image-container ${active ? 'active' : ''} ${
          selected ? 'selected' : ''
          }`}
      >
        <div className='svg-container'>
          <img className='nft-image' src={imageUrl} alt='' />
          <div className='nft-badge-container'>
            <img src={`/nfts/badge-level-${nftOption.level}.svg`} alt='' />
          </div>
        </div>
        <div className='nft-description'>
          <span className='rank'>{nftOption.rank}</span>
          <div className='price'>
            {nftOption.price === '0' && <>Free</>}
            {nftOption.price !== '0' && (
              <>
                <img src='/nfts/triangle.svg' alt='' />
                <span>{nftOption.price}</span>
              </>
            )}
          </div>
          <span className='description'>{nftOption.description}</span>
        </div>
      </div>
    </>
  );
}
