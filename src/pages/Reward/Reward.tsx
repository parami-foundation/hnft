import { Button, Card } from 'antd';
import React, { useEffect, useState } from 'react';
import LoadingBar from '../../components/LoadingBar/LoadingBar';
import UserAvatar from '../../components/UserAvatar/UserAvatar';
import { useNFTTokenUris } from '../../hooks/useNFTTokenUris';
import { getRewardTokenBalances, RewardTokenBalance, withdrawGovernanceTokenReward } from '../../services/relayer.service';
import { amountToFloatString } from '../../utils/format.util';
import './Reward.scss';
import { useNetwork } from 'wagmi';

export interface RewardProps { }

function Reward({ }: RewardProps) {
    const [rewardTokens, setRewardTokens] = useState<RewardTokenBalance[]>();
    const { chain } = useNetwork();

    const hnfts = useNFTTokenUris((rewardTokens ?? []).map(rewardToken => rewardToken.hnft_token_id));

    useEffect(() => {
        getRewardTokenBalances().then(res => {
            if (res) {
                setRewardTokens(res);
            }
        })
    }, [])

    return <>
        <div className='reward-container'>
            <div className='reward-content'>
                <div className='header'>
                    <div className='title'>My Reward</div>
                    <div className='description'>The revenue you get from watching hNFT ads is already prepared for you</div>
                </div>

                <Card>
                    {!rewardTokens && <>
                        <LoadingBar></LoadingBar>
                    </>}

                    {rewardTokens && <>
                        {!rewardTokens.length && <>
                            You haven't earned any rewards yet.
                        </>}

                        {rewardTokens.length > 0 && <>
                            {rewardTokens.map((rewardToken, index) => {
                                return <>
                                    <div className='token-reward' key={`${rewardToken.hnft_contract_addr}${rewardToken.hnft_token_id}`}>
                                        <div className='token-info'>
                                            <div className='token-icon'>
                                                <UserAvatar src={(hnfts[index]?.image) ?? '/images/logo_black.png'} className='hnft-image'></UserAvatar>
                                            </div>
                                            <div className='token'>
                                                <div className='token-symbol'>
                                                    $ {hnfts[index]?.symbol ?? 'NFT Power'}
                                                </div>
                                                <div className='chain-info'>
                                                    Ethereum
                                                </div>
                                            </div>
                                        </div>
                                        <div className='reward-amount'>
                                            {amountToFloatString(rewardToken.balance)}
                                        </div>
                                        <div className='btn-container'>
                                            {!!Number(rewardToken.balance) && <>
                                                <Button type="primary" onClick={() => {
                                                    withdrawGovernanceTokenReward(rewardToken.hnft_token_id, chain!.id, rewardToken.balance).then(res => {
                                                        console.log('got withdraw signature', res);
                                                    })
                                                }}>Claim</Button>
                                            </>}

                                            {!Number(rewardToken.balance) && <>
                                                <Button type="primary" disabled>Claim</Button>
                                            </>}
                                        </div>
                                    </div>
                                </>
                            })}
                        </>}
                    </>}
                </Card>
            </div>
        </div>
    </>;
};

export default Reward;
