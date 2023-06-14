import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Form, Input, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import './IssueToken.scss';
import { useIssueGovernanceToken } from '../../hooks/useIssueGovernanceToken';
import { useHNFT } from '../../hooks';

export interface IssueTokenProps { }

export function IssueToken({ }: IssueTokenProps) {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const hnft = useHNFT();
  const [tokenInfo, setTokenInfo] = useState<{ name: string, symbol: string }>()
  const { issueToken, isSuccess, isLoading } = useIssueGovernanceToken(hnft.address, hnft.tokenId, tokenInfo?.name, tokenInfo?.symbol);
  const issueTokenReady = !!issueToken;

  const onFinish = () => {
    form.validateFields().then((values: any) => {
      setTokenInfo(values);
    });
  };

  useEffect(() => {
    if (issueTokenReady && tokenInfo) {
      issueToken?.();
    }
  }, [issueTokenReady, tokenInfo]);

  useEffect(() => {
    if (isSuccess) {
      notification.success({
        message: 'Issue Governance Token Success!'
      });
      navigate('/');
    }
  }, [isSuccess]);

  return (
    <>
      <div className='issue-token'>
        <div className='issue-token-breadcrumb'>
          <Breadcrumb>
            <Breadcrumb.Item onClick={() => navigate('/')}>
              Mint Hnft
            </Breadcrumb.Item>
            <Breadcrumb.Item>nft power Details</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className='issue-token-content'>
          <div className='title'>NFT power Details</div>
          <Form form={form} layout='vertical' autoComplete='off'>
            <Form.Item
              name='name'
              label='NFT power name'
              required
              help='Choose a name for your NFT power.'
              initialValue={window.localStorage.getItem('name')}
            >
              <Input className='issue-token-input' />
            </Form.Item>
            <Form.Item
              name='symbol'
              label='NFT power symbol'
              required
              initialValue={window.localStorage.getItem('symbol')}
            >
              <Input className='issue-token-input' />
            </Form.Item>
          </Form>
          <div className='issue-token-footer'>
            <Button onClick={onFinish} type="primary" loading={isLoading}>Confirm</Button>
          </div>
        </div>
      </div>
    </>
  );
}
