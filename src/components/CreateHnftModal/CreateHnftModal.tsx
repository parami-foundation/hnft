import {
  Button,
  message,
  notification,
  Upload,
  Modal,
  Image as AntdImage,
} from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import type { RcFile, UploadProps } from 'antd/es/upload/interface';
import { CloudUploadOutlined } from '@ant-design/icons';
import { isMobile } from 'react-device-detect';
import ImgCrop from 'antd-img-crop';
import cs from 'classnames';
import { HNFT_CONFIG, BillboardLevel2Name } from '../../models/hnft';
import { IPFS_ENDPOINT, IPFS_UPLOAD } from '../../models/wnft';
import { BillboardNftImage } from '../../components/BillboardNftImage';
import MobileDrawer from '../MobileDrawer/MobileDrawer';
import './CreateHnftModal.scss';
import {
  useAD3Balance,
  useHNFT,
  useApproveAD3,
  useMintBillboard,
  useUpgradeBillboard,
  useBillboardPrices,
} from '../../hooks';
import {
  amountToFloatString,
  formatTwitterImageUrl,
} from '../../utils/format.util';
import { TwitterUser } from '../../services/twitter.service';

const { Dragger } = Upload;

export interface HnftProps {
  onCancel: () => void;
  onCreate: () => void;
  upgrade?: boolean;
  twitterUser?: TwitterUser | null;
}

export type HNFT_RANK = keyof typeof BillboardLevel2Name;

export function CreateHnftModal({
  onCancel,
  onCreate,
  upgrade,
  twitterUser,
}: HnftProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [createHnftLoading, setCreateHnftLoading] = useState<boolean>(false);
  const [imageUrl, setimageUrl] = useState<string>();
  const [price, setPrice] = useState<number>();
  const [mintLevel, setMintLevel] = useState<number>();
  const hnft = useHNFT();
  const blance = useAD3Balance();
  const prices = useBillboardPrices();

  const {
    mint,
    isSuccess: mintSuccess,
    isLoading: mintLoading,
    error: mintError,
  } = useMintBillboard(mintLevel, imageUrl ?? ''); // default image?
  const {
    upgradeHnft,
    isSuccess: upgradeSuccess,
    isLoading: upgradeLoading,
    error: upgradeError,
  } = useUpgradeBillboard(hnft.tokenId, mintLevel);
  const {
    approve,
    isLoading: approveLoading,
    isSuccess: approveSuccess,
    error: approveError,
  } = useApproveAD3(price);

  useEffect(() => {
    if (hnft.tokenId || twitterUser) {
      setimageUrl(
        hnft?.image || formatTwitterImageUrl(twitterUser?.profile_image_url)
      );
    }
  }, [hnft, twitterUser]);

  const handleCreateHnft = useCallback(() => {
    setCreateHnftLoading(true);
    if (mintLevel !== undefined) {
      // free mint
      if (mintLevel === 0 || (mintLevel === 1 && hnft.onWhitelist)) {
        console.log('free mint')
        mint?.();
      } else {
        // approve ad3
        const currentHnftPrice = prices[hnft.level];
        const upgradeHnftPrice = prices[mintLevel];
        const priceDiff =
          Number(amountToFloatString(upgradeHnftPrice) ?? 0) -
          Number(amountToFloatString(currentHnftPrice!) ?? 0);
        setPrice(priceDiff);
      }
    }
  }, [mintLevel]);

  useEffect(() => {
    if (approveError || mintError || upgradeError) {
      notification.warning({
        message:
          approveError?.message || mintError?.message || upgradeError?.message,
      });
    }
  }, [approveError, mintError, upgradeError]);

  useEffect(() => {
    if (price && blance >= price && approve) {
      console.log('approve')
      approve();
    }
  }, [price]);

  useEffect(() => {
    if (approveSuccess) {
      if (upgrade) {
        upgradeHnft?.();
      } else {
        mint?.();
      }
    }
  }, [upgrade, approveSuccess]);

  useEffect(() => {
    if (mintSuccess || upgradeSuccess) {
      onMintSuccess();
    }
  }, [mintSuccess, upgradeSuccess]);

  const onMintSuccess = () => {
    notification.success({
      message: 'Create HNFT Success',
    });
    setCreateHnftLoading(false);
    onCreate();
  };

  const handleSelectedLevel = (rank: number) => {
    // if (Number(rank) > 1) {
    //   message.info('coming soon');
    //   return;
    // }

    // already superlative
    if (upgrade && Number(hnft?.level) >= Number(rank)) {
      return;
    }
    setMintLevel(rank);
  };

  const props: UploadProps = {
    name: 'file',
    multiple: false,
    action: IPFS_UPLOAD,
    onChange(info) {
      if (info.file.status === 'uploading') {
        setLoading(true);
        return;
      }
      if (info.file.status === 'done') {
        const ipfsHash = info.file.response.Hash;
        setimageUrl(IPFS_ENDPOINT + ipfsHash);
        return;
      }
      if (info.file.status === 'error') {
        message.error('Upload Image Error');
        setLoading(false);
      }
    },
    beforeUpload(file: RcFile) {
      const isJpgOrPng =
        file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        notification.error({
          message: 'You can only upload JPG/PNG file!',
        });
      }
      const isLt4M = file.size / 1024 / 1024 < 4;
      if (!isLt4M) {
        notification.error({
          message: 'Image must smaller than 4MB!',
        });
      }
      return isJpgOrPng && isLt4M;
    },
    showUploadList: false,
    disabled: loading || !!imageUrl,
  };

  const renderCreateHNFT = () => (
    <>
      {!imageUrl && !upgrade && (
        <ImgCrop quality={1} modalTitle='Edit image'>
          <Dragger {...props} className='upload-dragger'>
            {/* {imageUrl && (
              <AntdImage
                width={200}
                preview={false}
                src={imageUrl}
                referrerPolicy='no-referrer'
              ></AntdImage>
            )} */}
            <>
              <p className='ant-upload-drag-icon'>
                <CloudUploadOutlined className='upload-icon' />
              </p>
              <p className='ant-upload-text'>Upload Image to Create HNFT</p>
              <p className='ant-upload-hint'>
                Click or drag file to this area to upload
              </p>
            </>
          </Dragger>
        </ImgCrop>
      )}

      {(imageUrl || upgrade) && (
        <div className='create-nfts'>
          <div className='nfts-container'>
            {HNFT_CONFIG.map((nftOption, index) => {
              return (
                <div
                  key={index}
                  style={{ minWidth: '50%' }}
                  onClick={() => handleSelectedLevel(nftOption.level)}
                  className={cs(
                    'nfts-items',
                    upgrade &&
                      Number(hnft?.level) >= nftOption.level &&
                      'disabled',
                    mintLevel === nftOption.level && 'selected',
                    nftOption?.rank
                  )}
                >
                  <BillboardNftImage
                    imageUrl={imageUrl}
                    nftOption={nftOption}
                    className={
                      isMobile ? 'nft-image-container-mobile-create' : ''
                    }
                  />
                </div>
              );
            })}
          </div>
          <div className='nfts-footer'>
            {/* <div className='trading-detail'>
              <div className='gas-fee'>
                <span>Gas Fee</span>
                <span>0.0002eth</span>
              </div>
              <div className='blance'>
                <span>Balance</span>
                <span>{blance}</span>
              </div>
            </div> */}
            <div className='nfts-buttons'>
              <Button key='back' onClick={onCancel}>
                Cancel
              </Button>
              <Button
                key='submit'
                type='primary'
                disabled={mintLevel === undefined}
                loading={createHnftLoading}
                onClick={handleCreateHnft}
              >
                {upgrade ? 'Upgrade' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {isMobile && (
        <>
          <MobileDrawer onClose={onCancel} closable={true}>
            {renderCreateHNFT()}
          </MobileDrawer>
        </>
      )}

      {!isMobile && (
        <>
          <Modal
            title={`${upgrade ? 'Upgrade' : 'Mint'} my hNFT`}
            centered
            open
            onCancel={onCancel}
            width={1117}
            closable={false}
            wrapClassName='mint-my-hnft'
            footer={null}
          >
            {renderCreateHNFT()}
          </Modal>
        </>
      )}
    </>
  );
}
