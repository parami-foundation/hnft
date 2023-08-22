import React, { useEffect, useState } from 'react';
import './BidAiAd.scss';
import { useParams } from 'react-router-dom';
import { Character } from '../../models/character';
import { queryCharacter } from '../../services/ai.service';
import { notification } from 'antd';
import { Button, Form, Input } from 'antd';
import { useAiAdBid } from '../../hooks/useAiAdBid';

export interface BidAiAdProps { }

type FieldType = {
    description?: string;
    link?: string;
};

function BidAiAd({ }: BidAiAdProps) {
    let { handle } = useParams() as { handle: string };
    const [character, setCharacter] = useState<Character>();
    const [adInfo, setAdInfo] = useState<FieldType>();

    useEffect(() => {
        if (handle) {
            queryCharacter({ twitter_handle: handle }).then(character => {
                if (character && character.name) {
                    setCharacter(character);
                } else {
                    notification.warning({
                        message: 'Character not found',
                    })
                }
            })
        }
    }, [handle])

    const onFinish = (values: FieldType) => {
        console.log('Success:', values);
        setAdInfo(values);
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };


    const { bidAd, isSuccess: bidSuccess } = useAiAdBid(`0x1234`, adInfo?.description, adInfo?.link);
    const bidReady = bidAd && adInfo;


    useEffect(() => {
        if (bidReady) {
            bidAd?.();
        }
    }, [bidReady])

    useEffect(() => {
        if (bidSuccess) {
            notification.success({
                message: 'AD bid success!'
            })
        }
    }, [bidSuccess])


    return <>
        <div className='bid-ai-ad-container'>
            {!character && <>
                Loading...
            </>}
            {character && <>
                <div className='avatar-container'>
                    <img className='avatar' src={character.avatar_url} referrerPolicy='no-referrer'></img>
                </div>

                <div className='form-container'>
                    <Form
                        name="basic"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        style={{ maxWidth: 600 }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                    >
                        <Form.Item<FieldType>
                            label="Description"
                            name="description"
                            rules={[{ required: true, message: 'Please input your AD description!' }]}
                        >
                            <Input placeholder='short description' />
                        </Form.Item>

                        <Form.Item<FieldType>
                            label="AD link"
                            name="link"
                            rules={[{ required: true, message: 'Please input your AD link!' }]}
                        >
                            <Input placeholder='link to your ad' />
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </>}
        </div>
    </>;
};

export default BidAiAd;
