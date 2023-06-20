import { Card, Col, notification, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import LoadingBar from '../../components/LoadingBar/LoadingBar';
import { useAuctionWithdrawToken } from '../../hooks/useAuctionWithdrawToken';
import { getWithdrawSigOfTxn, getWithdrawTxns, GovernanceTokenRewardTxn, WithdrawSignature } from '../../services/relayer.service';
import './Withdraws.scss';

export interface WithdrawsProps { }

function Withdraws({ }: WithdrawsProps) {
    const [withdrawTxns, setWithdrawTxns] = useState<GovernanceTokenRewardTxn[]>();
    const [withdrawSig, setWithdrawSig] = useState<WithdrawSignature>();

    const { withdrawToken, isSuccess, isError, error } = useAuctionWithdrawToken(withdrawSig);
    const withdrawReady = !!withdrawToken;

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
            withdrawToken?.();
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
        getWithdrawTxns().then(txns => {
            if (txns) {
                setWithdrawTxns(txns);
            }
        })
    }, [])

    return <>
        <div className='withdraws-container'>
            <div className='withdraws-content'>
                <div className='header'>
                    <div className='title'>My Withdraws</div>
                    <div className='description'>Claim your previous withdraws</div>
                </div>

                <div className='withdraw-txns'>
                    {!withdrawTxns && <>
                        <LoadingBar></LoadingBar>
                    </>}

                    {withdrawTxns && <>
                        {!withdrawTxns.length && <>
                            <p>No withdraw records.</p>
                        </>}

                        {withdrawTxns.length > 0 && <>
                            {withdrawTxns.map(txns => {
                                return <>
                                    <Card className='withdraw-txn-card'>
                                        <Row>
                                            <Col span={4} className="txn-info-col">
                                                <span>hNFT tokenId</span>
                                                <span>{txns.hnft_token_id}</span>
                                            </Col>
                                            <Col span={12} className="txn-info-col">
                                                <span>Claim Status</span>
                                                <span onClick={() => {
                                                    getWithdrawSigOfTxn(txns.id).then(res => {
                                                        if (res) {
                                                            setWithdrawSig(res);
                                                        }
                                                    })
                                                }}>
                                                    Claim Token
                                                </span>
                                            </Col>
                                            <Col span={8} className="txn-info-col">
                                                <span>Time</span>
                                                <span>{txns.created_time}</span>
                                            </Col>
                                        </Row>
                                    </Card>
                                </>
                            })}

                        </>}
                    </>}
                </div>
            </div>
        </div>
    </>;
};

export default Withdraws;
