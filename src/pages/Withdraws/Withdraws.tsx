import { Card, Col, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import LoadingBar from '../../components/LoadingBar/LoadingBar';
import { getWithdrawTxns, GovernanceTokenRewardTxn } from '../../services/relayer.service';
import './Withdraws.scss';

export interface WithdrawsProps { }

function Withdraws({ }: WithdrawsProps) {
    const [withdrawTxns, setWithdrawTxns] = useState<GovernanceTokenRewardTxn[]>();

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
                                                <span>{txns.hnft_id}</span>
                                            </Col>
                                            <Col span={12} className="txn-info-col">
                                                <span>Claim Status</span>
                                                <span>
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
