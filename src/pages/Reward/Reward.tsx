import { Button, Card } from 'antd';
import React from 'react';
import UserAvatar from '../../components/UserAvatar/UserAvatar';
import './Reward.scss';

export interface RewardProps { }

function Reward({ }: RewardProps) {
    return <>
        <div className='reward-container'>
            <div className='reward-content'>
                <div className='header'>
                    <div className='title'>My Reward</div>
                    <div className='description'>The revenue you get from watching hNFT ads is already prepared for you</div>
                </div>

                <Card>
                    <div className='token-reward'>
                        <div className='token-info'>
                            <div className='token-icon'>
                                <UserAvatar src='/images/logo_black.png' className='hnft-image'></UserAvatar>
                            </div>
                            <div className='token'>
                                <div className='token-symbol'>
                                    $ {'KK'}
                                </div>
                                <div className='chain-info'>
                                    Ethereum
                                </div>
                            </div>
                        </div>
                        <div className='reward-amount'>
                            0.0001
                        </div>
                        <div className='btn-container'>
                            <Button type="primary" onClick={() => {
                                console.log('claim reward')
                            }}>Claim</Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    </>;
};

export default Reward;
