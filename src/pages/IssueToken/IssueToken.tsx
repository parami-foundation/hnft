import React, { useState, useEffect } from 'react';
import { Breadcrumb, Button, Form, Input } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  fetchTwitterUser,
  TwitterUser,
} from '../../services/twitter.service';
import './IssueToken.scss';

export interface IssueTokenProps {}

export function IssueToken({}: IssueTokenProps) {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [twitterUser, setTwitterUser] = useState<TwitterUser | null>();

  useEffect(() => {
    if (searchParams) {
      const oauth_token = searchParams.get('oauth_token');
      const oauth_verifier = searchParams.get('oauth_verifier');

      if (oauth_token && oauth_verifier) {
        fetchTwitterUser(oauth_token, oauth_verifier).then((twitterUser) => {
          setTwitterUser(twitterUser);
          setSearchParams({});
        });
      }
    }
  }, [searchParams]);

  console.log(twitterUser, '---twitterUser---');
  
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
          <Form
            form={form}
            layout='vertical'
            // onFinish={onFinish}
            autoComplete='off'
            // onValuesChange={handelValuesChanged}
          >
            <Form.Item
              name='name'
              label='NFT power name'
              required
              help='Choose a name for your NFT power.'
            >
              <Input className='issue-token-input' />
            </Form.Item>
            <Form.Item name='symbol' label='NFT power symbol' required>
              <Input className='issue-token-input' />
            </Form.Item>
          </Form>
          <div className='issue-token-footer'>
            <Button>Confirm</Button>
          </div>
        </div>
      </div>
    </>
  );
}
