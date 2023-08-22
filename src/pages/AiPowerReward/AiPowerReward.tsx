import { Button, Card, notification } from 'antd';
import React, { useEffect, useState } from 'react';
import LoadingBar from '../../components/LoadingBar/LoadingBar';
import { amountToFloatString } from '../../utils/format.util';
import './AiPowerReward.scss';
import { useWithdrawAiPower } from '../../hooks/useWithdrawAiPower';
import { PowerReward, WithdrawSignature, getPowerRewardWithdrawSig, getPowerRewards } from '../../services/ai.service';
import { useDynamicContext } from '@dynamic-labs/sdk-react';

export interface AiPowerRewardProps { }

function AiPowerReward({ }: AiPowerRewardProps) {
    const [aiPowers, setAiPowers] = useState<PowerReward[]>();
    const [withdrawSig, setWithdrawSig] = useState<WithdrawSignature>();

    const { withdrawPower, isSuccess, isError, error } = useWithdrawAiPower(withdrawSig);
    const withdrawReady = !!withdrawPower;

    const { authToken, setShowAuthFlow } = useDynamicContext();

    useEffect(() => {
        if (isError) {
            notification.warning({
                message: 'Withdraw Token Error',
                description: error?.message
            })
            setWithdrawSig(undefined);
        }
    }, [isError]);

    useEffect(() => {
        if (withdrawSig && withdrawReady) {
            withdrawPower?.();
        }
    }, [withdrawSig, withdrawReady])

    useEffect(() => {
        if (isSuccess) {
            notification.success({
                message: 'Withdraw Token Success'
            })
            setWithdrawSig(undefined);
        }
    }, [isSuccess])

    useEffect(() => {
        if (authToken) {
            getPowerRewards(authToken).then(res => {
                if (res) {
                    setAiPowers(res);
                }
            })
        } else {
            setShowAuthFlow(true);
        }
    }, [authToken]);

    return <>
        <div className='ai-power-reward-container'>
            <div className='reward-content'>
                <div className='header'>
                    <div className='title'>AI Powers</div>
                    <div className='description'>The revenue you get from AI</div>
                </div>

                <Card>
                    {!aiPowers && <>
                        <LoadingBar></LoadingBar>
                    </>}

                    {aiPowers && <>
                        {!aiPowers.length && <>
                            You haven't earned any rewards yet.
                        </>}

                        {aiPowers.length > 0 && <>
                            {aiPowers.map((aiPowerReward, index) => {
                                return <>
                                    <div className='token-reward' key={`${aiPowerReward.id}`}>
                                        <div className='token-info'>
                                            <div className='token-icon'>
                                                <img className='icon' src={aiPowerReward.token_icon} referrerPolicy='no-referrer'></img>
                                            </div>
                                            <div className='token'>
                                                <div className='token-symbol'>
                                                    {aiPowerReward.token_symbol} AI Power
                                                </div>
                                                <div className='chain-info'>
                                                    Ethereum
                                                </div>
                                            </div>
                                        </div>
                                        <div className='reward-amount'>
                                            {amountToFloatString(aiPowerReward.amount)}
                                        </div>
                                        <div className='btn-container'>
                                            {!!Number(aiPowerReward.amount) && <>
                                                <Button type="primary" onClick={() => {
                                                    // todo: authToken null
                                                    getPowerRewardWithdrawSig(authToken ?? '', aiPowerReward.id).then(res => {
                                                        if (res) {
                                                            setWithdrawSig(res);
                                                        }
                                                    })
                                                }}>Claim</Button>
                                            </>}

                                            {!Number(aiPowerReward.amount) && <>
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

export default AiPowerReward;
