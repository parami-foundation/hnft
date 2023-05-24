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
import { ethers } from 'ethers';
import ImgCrop from 'antd-img-crop';
import cs from 'classnames';
import {
  EIP5489ForInfluenceMiningContractAddress,
  AD3ContractAddress,
  HNFT_CONFIG,
  BillboardLevel2Name,
  AuctionContractAddress,
} from '../../models/hnft';
import EIP5489ForInfluenceMining from '../../contracts/EIP5489ForInfluenceMining.json';
import AD3Contract from '../../contracts/AD3.json';
import { IPFS_ENDPOINT, IPFS_UPLOAD } from '../../models/wnft';
import { BillboardNftImage } from '../../components/BillboardNftImage';
import MobileDrawer from '../MobileDrawer/MobileDrawer';
import './CreateHnftModal.scss';
import { useAD3Balance, useCustomMetaMask, useHNFT } from '../../hooks';
import { amountToFloatString } from '../../utils/format.util';

const { Dragger } = Upload;

export interface HnftProps {
  onCancel: () => void;
  onCreate: () => void;
  upgrade?: boolean;
}

export type HNFT_RANK = keyof typeof BillboardLevel2Name;

export function CreateHnftModal({ onCancel, onCreate, upgrade }: HnftProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const { ethereum } = useCustomMetaMask();
  const [createHnftLoading, setCreateHnftLoading] = useState<boolean>(false);
  const [hnftContract, setHnftContract] = useState<ethers.Contract>();
  const [imageUrl, setimageUrl] = useState<string>();
  const [selectedLevel, setselectedLevel] = useState<HNFT_RANK>();
  const blance = useAD3Balance();
  const { hnft, onWhitelist } = useHNFT();

  useEffect(() => {
    if (hnft) {
      setimageUrl(hnft?.image);
    }
  }, [hnft]);

  useEffect(() => {
    if (ethereum) {
      setHnftContract(
        new ethers.Contract(
          EIP5489ForInfluenceMiningContractAddress,
          EIP5489ForInfluenceMining.abi,
          new ethers.providers.Web3Provider(ethereum).getSigner()
        )
      );
    }
  }, [ethereum]);

  const approveAD3 = async (selectedLevel: HNFT_RANK) => {
    if (hnftContract) {
      const approveContract = new ethers.Contract(
        AD3ContractAddress,
        AD3Contract.abi,
        new ethers.providers.Web3Provider(ethereum).getSigner()
      );

      const currentHnftPrice = Number(hnft?.price ?? 0);
      const upgradeHnftPrice = await hnftContract.level2Price(selectedLevel);
      const differencePrice =
        Number(amountToFloatString(upgradeHnftPrice)) - currentHnftPrice;

      if (blance >= differencePrice) {
        try {
          return await approveContract.approve(
            EIP5489ForInfluenceMiningContractAddress,
            differencePrice
          );
        } catch (error) {}
      } else {
        setCreateHnftLoading(false);
        message.warn('insufficient balance');
      }
    }
  };

  const onMintSuccess = () => {
    notification.success({
      message: 'Create HNFT Success',
    });
    setCreateHnftLoading(false);
    onCreate();
  };

  const mintHnftFromImage = async (selectedLevel: HNFT_RANK) => {
    // free mint
    if (hnftContract) {
      if (selectedLevel === 0 || (selectedLevel === 1 && onWhitelist)) {
        const resp = await hnftContract.mint(imageUrl, selectedLevel);
        await resp.wait();
        return resp;
      } else {
        await approveAD3(selectedLevel).then(async (res: any) => {
          if (res) {
            const resp = await hnftContract.mint(imageUrl, selectedLevel);
            await resp.wait();
            return resp;
          }
        });
      }
    }
  };

  const createHnft = useCallback(
    async (imageUrl: string) => {
      if (hnftContract) {
        try {
          setCreateHnftLoading(true);
          if (selectedLevel !== undefined) {
            if (upgrade) {
              await approveAD3(selectedLevel).then(async (res: any) => {
                if (res) {
                  const resp = await hnftContract.upgradeTo(
                    hnft?.tokenId,
                    selectedLevel
                  );
                  await resp.wait();
                  onMintSuccess();
                }
              });
            } else {
              await mintHnftFromImage(selectedLevel).then((res: any) => {
                if (res) {
                  hnftContract.authorizeSlotTo(
                    hnft?.tokenId,
                    AuctionContractAddress
                  );
                  onMintSuccess();
                }
              });
            }
          }
        } catch (e) {
          notification.error({
            message: 'Create HNFT Error',
            description: JSON.stringify(e),
          });
          setCreateHnftLoading(false);
        }
      }
    },
    [hnftContract, selectedLevel]
  );

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

  const handleSelectedLevel = (rank: HNFT_RANK) => {
    if (upgrade && Number(hnft?.level) >= Number(rank)) {
      return;
    }
    setselectedLevel(rank);
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
                    selectedLevel === nftOption.level && 'selected'
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
            <div className='trading-detail'>
              <div className='gas-fee'>
                <span>Gas Fee</span>
                <span>0.0002eth</span>
              </div>
              <div className='blance'>
                <span>Balance</span>
                <span>{blance}</span>
              </div>
            </div>
            <div className='nfts-buttons'>
              <Button key='back' onClick={onCancel}>
                Cancel
              </Button>
              <Button
                key='submit'
                type='primary'
                disabled={selectedLevel === undefined}
                loading={createHnftLoading}
                onClick={() => createHnft(imageUrl!)}
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
