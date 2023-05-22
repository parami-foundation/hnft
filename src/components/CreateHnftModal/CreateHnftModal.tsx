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
import { ethers } from 'ethers';
import ImgCrop from 'antd-img-crop';
import cs from 'classnames';
import {
  HNFTCollectionContractAddress,
  AD3ContractAddress,
} from '../../models/contract';
import EIP5489ForInfluenceMining from '../..//EIP5489ForInfluenceMining.json';
import { IPFS_ENDPOINT, IPFS_UPLOAD } from '../../models/wnft';
import AD3Contract from '../../AD3.json';
import {
  HNFT_CONFIG,
  BillboardLevel2Name,
  BillboardLevel2Price,
} from '../../models/hnft';
import { BillboardNftImage } from '../../components/BillboardNftImage';
import './CreateHnftModal.scss';
import { useCustomMetaMask } from '../../hooks/useCustomMetaMask';
import { useAD3Blance } from '../../hooks/useAD3Balance';
import { useHNFT } from '../../hooks/useHNFT';

const { Dragger } = Upload;

export interface HnftProps {
  onCancel: () => void;
  onCreate: () => void;
  upgrade?: boolean;
}

export type HNFT_RANK = keyof typeof BillboardLevel2Name;

export function CreateHnftModal({ onCancel, onCreate, upgrade }: HnftProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const { ethereum, chainId } = useCustomMetaMask();
  const [createHnftLoading, setCreateHnftLoading] = useState<boolean>(false);
  const [hnftContract, setHnftContract] = useState<ethers.Contract>();
  const [imageUrl, setimageUrl] = useState<string>();
  const [selectedLevel, setselectedLevel] = useState<HNFT_RANK>();
  const blance = useAD3Blance();
  const { hnft } = useHNFT();

  useEffect(() => {
    if (hnft) {
      setimageUrl(hnft?.image);
    }
  }, [hnft]);

  useEffect(() => {
    if (ethereum && (chainId === 1 || chainId === 5)) {
      setHnftContract(
        new ethers.Contract(
          HNFTCollectionContractAddress[chainId],
          EIP5489ForInfluenceMining.abi,
          new ethers.providers.Web3Provider(ethereum).getSigner()
        )
      );
    }
  }, [ethereum, chainId]);

  const approveAD3 = async (selectedLevel: HNFT_RANK, chainId: number) => {
    const approveContract = new ethers.Contract(
      AD3ContractAddress[chainId],
      AD3Contract.abi,
      new ethers.providers.Web3Provider(ethereum).getSigner()
    );

    const currentHnftPrice = Number(hnft?.price) * 1000;
    const upgradeHnftPrice = Number(BillboardLevel2Price[selectedLevel]) * 1000;
    const differencePrice = upgradeHnftPrice - currentHnftPrice;

    if (Number(blance) * 1000 >= differencePrice) {
      try {
        return await approveContract.approve(
          HNFTCollectionContractAddress[chainId],
          differencePrice
        );
      } catch (error) {}
    }
  };

  const onMintSuccess = () => {
    notification.success({
      message: 'Create HNFT Success',
    });
    setCreateHnftLoading(false);
    onCreate();
  };

  const mintHnftFromImage = async (
    selectedLevel: HNFT_RANK,
    chainId: number
  ) => {
    // free mint
    if (hnftContract) {
      if (selectedLevel === '0') {
        const resp = await hnftContract.mint(imageUrl, selectedLevel);
        await resp.wait();
      } else {
        await approveAD3(selectedLevel, chainId).then(async (res: any) => {
          await hnftContract.upgradeTo(hnft?.tokenId, selectedLevel);
        });
      }
    }
  };

  const createHnft = useCallback(
    async (imageUrl: string) => {
      if (hnftContract && (chainId === 1 || chainId === 5)) {
        try {
          setCreateHnftLoading(true);
          if (selectedLevel) {
            if (upgrade) {
              await approveAD3(selectedLevel, chainId).then(
                async (res: any) => {
                  await hnftContract
                    .upgradeTo(hnft?.tokenId, selectedLevel)
                    .then((res: any) => {
                      onMintSuccess();
                    });
                }
              );
            } else {
              await mintHnftFromImage(selectedLevel, chainId).then((res) => {
                onMintSuccess();
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
    [hnftContract, chainId, selectedLevel]
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

  return (
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
                  <span>0.8eth</span>
                </div>
              </div>
              <div className='nfts-buttons'>
                <Button key='back' onClick={onCancel}>
                  Cancel
                </Button>
                <Button
                  key='submit'
                  type='primary'
                  disabled={!selectedLevel}
                  loading={createHnftLoading}
                  onClick={() => createHnft(imageUrl!)}
                >
                  {upgrade ? 'Upgrade' : 'Create'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
