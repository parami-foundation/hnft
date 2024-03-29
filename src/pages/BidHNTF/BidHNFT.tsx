import React, { useEffect, useState } from 'react';
import {
  Button,
  Input,
  Form,
  message,
  Upload,
  InputNumber,
  Collapse,
  Select,
  notification,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { compressImageFile, uploadProps } from '../../utils/upload.util';
import type { UploadFile } from 'antd/es/upload/interface';
import { useSearchParams } from 'react-router-dom';
import UserAvatar from '../../components/UserAvatar/UserAvatar';
import styles from './BidHNFT.module.scss';
import { useHNFT } from '../../hooks/useHNFT';
import { usePreBid } from '../../hooks/usePreBid';
import { useCurBid } from '../../hooks/useCurrentBid';
import { useCommitBid } from '../../hooks/useCommitBid';
import { useAD3Balance } from '../../hooks/useAD3Balance';
import { useApproveAD3 } from '../../hooks/useApproveAD3';
import { useAuctionEvent } from '../../hooks/useAuctionEvent';
import { BidWithSignature, createAdMeta, createBid } from '../../services/bid.service';
import { uploadIPFS } from '../../services/ipfs.service';
import {
  AuctionContractAddress,
  EIP5489ForInfluenceMiningContractAddress,
} from '../../models/hnft';
import {
  inputFloatStringToAmount,
  formatAd3Amount,
} from '../../utils/format.util';
import { useAuthorizeSlotTo } from '../../hooks/useAuthorizeSlotTo';
import { useApproveGovernanceToken } from '../../hooks/useApproveGovernanceToken';
import { useHnftGovernanceToken } from '../../hooks/useHnftGovernanceToken';
import { useNetwork } from 'wagmi';

const { Panel } = Collapse;
const { Option } = Select;

interface BidHNFTProps { }

export enum IMAGE_TYPE {
  ICON = 'icon',
  POSTER = 'poster',
}

export interface UserInstruction {
  text: string;
  tag?: string;
  score?: number;
  link?: string;
}

// todo: get form auction.sol, current this is private
const MIN_DEPOIST_FOR_PRE_BID = 10;

const BidHNFT: React.FC<BidHNFTProps> = (props) => {
  const [form] = Form.useForm();
  const content = Form.useWatch('title', form);
  const [params] = useSearchParams();
  const tokenId = Number(params.get('tokenId') || '');
  const hnftAddress = params.get('hnftAddress') || '';
  const governanceToken = useHnftGovernanceToken(hnftAddress, `${tokenId}`);

  const [adMetadataUrl, setAdMetadataUrl] = useState<string>();
  const [adMetaId, setAdMetaId] = useState<number>();
  const [iconUploadFiles, setIconUploadFiles] = useState<UploadFile[]>([]);
  const [posterUploadFiles, setPosterUploadFiles] = useState<UploadFile[]>([]);
  const [bidLoading, setBidLoading] = useState<boolean>(false);
  const [bidWithSig, setBidWithSig] = useState<BidWithSignature>();
  const [bidPreparedEvent, setBidPreparedEvent] = useState<any>();
  const [bidPrice, setBidPrice] = useState<number>(0);
  const { chain } = useNetwork();

  useEffect(() => {
    form.setFieldsValue({
      reward_rate_in_100_percent: 10,
      lifetime: 1,
      payout_base: 1,
      payout_max: 1,
      payout_min: 1,
    })
  }, [])

  const currentPrice = Number(
    formatAd3Amount(useCurBid(hnftAddress, tokenId)?.amount)
  );
  const minPrice = Math.max(currentPrice * 1.2, 0);

  const { approve: approveDeposit, isSuccess: approveDepositSuccess } = useApproveAD3(
    inputFloatStringToAmount(String(MIN_DEPOIST_FOR_PRE_BID))
  );

  const {
    approve: approveGovernanceToken,
    isSuccess: approveGovernanceTokenSuccess
  } = useApproveGovernanceToken(governanceToken.address as `0x${string}`, inputFloatStringToAmount(`${bidPrice}`));

  const { currentSlotManager } = useAuthorizeSlotTo(tokenId, AuctionContractAddress);
  useEffect(() => {
    if (currentSlotManager && currentSlotManager.toLowerCase() !== AuctionContractAddress.toLowerCase()) {
      notification.warning({
        duration: null,
        message: 'This hNFT is not available for bidding.',
        description: 'Please try another one'
      })
    }
  }, [currentSlotManager])

  const {
    preBid,
    isSuccess: preBidSuccess,
    prepareError: preBidPrepareError,
  } = usePreBid(hnftAddress, tokenId);
  const preBidReady = !!preBid;

  const { unwatch } = useAuctionEvent(
    'BidPrepared',
    (events: any[]) => {
      if (events.length) {
        const { bidder, curBidId, goverAddr, hNFTContractAddr, preBidId } = events[0].args;
        console.log('Bid Prepared Event:', bidder, curBidId, preBidId);
        setBidPreparedEvent({
          bidder,
          curBidId,
          preBidId,
        });
      }
    }
  );
  const { commitBid, isSuccess: commitBidSuccess } = useCommitBid(
    tokenId,
    hnftAddress,
    inputFloatStringToAmount(String(bidPrice)),
    adMetadataUrl,
    bidWithSig?.sig,
    bidWithSig?.prev_bid_id,
    bidWithSig?.id,
    bidWithSig?.last_bid_remain
  );
  const commitBidReady = !!commitBid;

  useEffect(() => {
    if (approveDepositSuccess && approveGovernanceTokenSuccess && preBidReady) {
      preBid?.();
    }
  }, [approveDepositSuccess, approveGovernanceTokenSuccess, preBidReady]);

  useEffect(() => {
    if (preBidPrepareError) {
      console.log('prebid prepare error', preBidPrepareError);
    }
  }, [preBidPrepareError]);

  useEffect(() => {
    if (bidPreparedEvent && bidPreparedEvent.bidder) {
      console.log('bid prepare event done. create bid now...');
      createBid(
        adMetaId!,
        EIP5489ForInfluenceMiningContractAddress,
        tokenId,
        inputFloatStringToAmount(String(bidPrice)),
        chain!.id
      ).then((bidWithSig) => {
        console.log('create bid got sig', bidWithSig);
        setBidWithSig(bidWithSig);
      });
    }
  }, [bidPreparedEvent, tokenId]);

  useEffect(() => {
    if (bidWithSig && commitBidReady) {
      commitBid?.();
    }
  }, [bidWithSig, commitBidReady]);

  useEffect(() => {
    if (commitBidSuccess) {
      // todo: refresh and clear state
      setBidLoading(false);
      message.success('commit bid success!!');
    }
  }, [commitBidSuccess]);

  useEffect(() => {
    if (adMetaId) {
      // todo: check ad3balance and governance token balance
      approveDeposit?.();
      approveGovernanceToken?.();
    }
  }, [adMetaId])

  const onFinish = async () => {
    try {
      console.log('bid process: upload ipfs, create adMeta, approve deposit');
      await form.validateFields();
      const formValues = form.getFieldsValue(true);
      setBidPrice(formValues.bid_price);
      console.log('submit form values', formValues);
      setBidLoading(true);
      const uploadRes = await uploadIPFS({
        ...formValues,
        icon: formValues.icon.file.url,
        poster: formValues.poster.file.url
      });

      const metadataUrl = `https://ipfs.parami.io/ipfs/${uploadRes.Hash}`
      setAdMetadataUrl(metadataUrl);

      // create ad meta
      const adMetaId = await createAdMeta({
        meta_ipfs_uri: metadataUrl,
        reward_rate_in_100_percent: formValues.reward_rate_in_100_percent,
        payout_base: formValues.payout_base,
        payout_max: formValues.payout_max,
        payout_min: formValues.payout_min,
        tags: [formValues.tag],
      });
      setAdMetaId(adMetaId);
    } catch (e) {
      console.log('prepare ad meta error', e);
      notification.warning({
        message: 'Create Ad metadata error'
      })
      setBidLoading(false);
    }
  };

  const handleBeforeUpload = (imageType: IMAGE_TYPE) => {
    return async (file: any) => {
      return await compressImageFile(file, imageType);
    };
  };

  const handleUploadOnChange = (imageType: IMAGE_TYPE) => {
    return (info: any) => {
      const { fileList } = info;
      if (info.file.status === 'done') {
        const ipfsHash = info.file.response.Hash;
        const imageUrl = 'https://ipfs.parami.io/ipfs/' + ipfsHash;
        fileList[0].url = imageUrl;
      }
      if (info.file.status === 'error') {
        message.error('Upload Image Error');
      }
      imageType === IMAGE_TYPE.POSTER
        ? setPosterUploadFiles(fileList)
        : setIconUploadFiles(fileList);
    };
  };

  if (!hnftAddress || !tokenId) {
    message.error('Invalid URL');
    return null;
  }

  return (
    <div className={styles.bidAdContainer}>
      <div className='bid-ad-content'>
        <div className='ad-header'>
          <div>Bid on HNFT</div>
          <span>Place your advertisement on HNFTs</span>
        </div>
        <Form
          form={form}
          layout='vertical'
          autoComplete='off'
          initialValues={{ remember: true }}
        >
          <div className='ad-content'>
            <div className='ad-form'>
              <div className='title'>Config your Ad</div>
              <Form.Item
                name='title'
                label='Content'
                required
                rules={[{ required: true, message: 'Please input content!' }]}
              >
                <Input className='ad-form-item' />
              </Form.Item>
              <Form.Item
                name='icon'
                label='Ad icon'
                required
                rules={[{ required: true, message: 'Please upload icon!' }]}
              >
                <Upload
                  {...uploadProps}
                  fileList={iconUploadFiles}
                  listType='picture'
                  onChange={handleUploadOnChange(IMAGE_TYPE.ICON)}
                  beforeUpload={handleBeforeUpload(IMAGE_TYPE.ICON)}
                >
                  <Button icon={<UploadOutlined />} className='ad-form-upload'>
                    Click to Upload
                  </Button>
                </Upload>
              </Form.Item>
              <Form.Item
                name='poster'
                label='Poster'
                required
                rules={[{ required: true, message: 'Please upload poster!' }]}
              >
                <Upload
                  {...uploadProps}
                  fileList={posterUploadFiles}
                  listType='picture'
                  onChange={handleUploadOnChange(IMAGE_TYPE.POSTER)}
                  beforeUpload={handleBeforeUpload(IMAGE_TYPE.POSTER)}
                >
                  <Button icon={<UploadOutlined />} className='ad-form-upload'>
                    Click to Upload
                  </Button>
                </Upload>
              </Form.Item>
              <Form.Item
                name='tag'
                label='Tag'
                required
                rules={[{ required: true, message: 'Please select tag!' }]}
              >
                <Select
                  size='large'
                  style={{
                    width: '100%',
                  }}
                  className='ad-form-item'
                >
                  <Option value='nft'>NFT</Option>
                  <Option value='twitter'>Twitter</Option>
                  <Option value='deFi'>DeFi</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name='score'
                label='Score'
                required
                rules={[{ required: true, message: 'Please input score!' }]}
              >
                <InputNumber min={1} max={100} className='ad-form-item' />
              </Form.Item>
              <Form.Item
                name='url'
                label='Link'
                required
                rules={[{ required: true, message: 'Please input link!' }]}
              >
                <Input className='ad-form-item' />
              </Form.Item>
              <Collapse ghost>
                <Panel header='Advanced Settings' key='1'>
                  <Form.Item
                    name='reward_rate_in_100_percent'
                    label='Reward Rate'
                    required
                    rules={[
                      { required: true, message: 'Please input reward rate!' },
                    ]}
                  >
                    <InputNumber min={0} max={100} className='ad-form-item' />
                  </Form.Item>
                  <Form.Item
                    name='lifetime'
                    label='lifetime'
                    required
                    rules={[
                      { required: true, message: 'Please select lifetime!' },
                    ]}
                  >
                    <Select
                      size='large'
                      style={{
                        width: '100%',
                      }}
                      className='ad-form-item'
                    >
                      <Option value={1}>1 DAY</Option>
                      <Option value={3}>3 DAYS</Option>
                      <Option value={7}>7 DAYS</Option>
                      <Option value={15}>15 DAYS</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name='payout_base'
                    label='Payout Base'
                    required
                    rules={[
                      { required: true, message: 'Please input payout base!' },
                    ]}
                  >
                    <InputNumber min={0} max={100} className='ad-form-item' />
                  </Form.Item>
                  <Form.Item
                    name='payout_min'
                    label='Payout Min'
                    required
                    rules={[
                      { required: true, message: 'Please input payout min!' },
                    ]}
                  >
                    <InputNumber min={0} max={100} className='ad-form-item' />
                  </Form.Item>
                  <Form.Item
                    name='payout_max'
                    label='Payout Max'
                    required
                    rules={[
                      { required: true, message: 'Please input payout max!' },
                    ]}
                  >
                    <InputNumber min={0} max={100} className='ad-form-item' />
                  </Form.Item>
                </Panel>
              </Collapse>
            </div>
            <div className='ad-preview'>
              <div className='title'>Ad Preview</div>
              <div className='content'>
                <div className='header'>
                  <UserAvatar
                    src={iconUploadFiles?.[0]?.url || ''}
                    className='avatar'
                  />
                  <div className='sponsor-desc'>
                    <span>is sponsoring this hNFT. </span>
                    <a className='bidLink' href='#' target='_blank'>
                      Bid on this ad space
                    </a>
                  </div>
                </div>
                <div className='section'>
                  <div className='arrow'></div>
                  <div className='ad-title' title={content}>
                    {content}
                  </div>
                  <div className='ad-poster'>
                    <img
                      src={
                        posterUploadFiles?.[0]?.url ||
                        '/images/rare_wall_bg.png'
                      }
                      referrerPolicy='no-referrer'
                      alt=''
                    ></img>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='ad-footer'>
            <div className='title'>Bid your price</div>
            <div className='bid-nfts'>
              <div className='bid-nfts-content'>
                <div className='bid-nfts-content-header'>
                  <div className='bid-nfts-content-header-item'>HNFT</div>
                  <div className='bid-nfts-content-header-item'>Min Price</div>
                  <div className='bid-nfts-content-header-item'>
                    Offer a price
                  </div>
                </div>
                <div className='bid-nfts-content-body'>
                  <div className='bid-nfts-content-body-item'>{`hNFT # ${tokenId}`}</div>
                  <div className='bid-nfts-content-body-item'>
                    {currentPrice}
                  </div>
                  <div className='bid-nfts-content-body-item'>
                    <Form.Item
                      name='bid_price'
                      required
                      rules={[
                        { required: true, message: 'Please input price!' },
                      ]}
                    >
                      <InputNumber
                        step={0.0001}
                        min={minPrice}
                        max={1000000}
                        className='bid-nfts-body-input'
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>
              <div className='bid-nfts-footer'>
                <Button
                  type='primary'
                  shape='round'
                  htmlType='submit'
                  className='bid-nfts-footer-btn'
                  onClick={onFinish}
                  loading={bidLoading}
                >
                  Bid
                </Button>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default BidHNFT;
