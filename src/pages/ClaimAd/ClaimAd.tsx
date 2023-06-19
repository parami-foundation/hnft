import React, { useEffect, useState } from 'react';
import LoadingBar from '../../components/LoadingBar/LoadingBar';
import './ClaimAd.scss';
import { useSearchParams } from 'react-router-dom';
import { notification } from 'antd';
import { claimToken } from '../../services/relayer.service';
import SigninModal from '../../components/SigninModal/SigninModal';

export interface ClaimAdProps { }

function ClaimAd({ }: ClaimAdProps) {
    const [params] = useSearchParams();
    const [showSigninModal, setShowSigninModal] = useState<boolean>();

    useEffect(() => {
        if (params) {
            const bidId = params.get('bidId');
            if (bidId) {
                claimToken(bidId).then(res => {
                    if (res === null) {
                        setShowSigninModal(true);
                        return;
                    }

                    if (res.success) {
                        notification.success({
                            message: 'Claim Successful!',
                            duration: 1
                        })
                        setTimeout(() => {
                            window.close();
                        }, 1000);
                        return;
                    }

                    notification.warning({
                        message: res.message ?? 'Network Error'
                    });
                })
            } else {
                notification.warning({
                    message: 'Could not find bidId'
                })
            }
        }
    }, [params])

    return <>
        <div className='claim-ad-container'>
            <LoadingBar></LoadingBar>
        </div>
        {showSigninModal && <>
            <SigninModal></SigninModal>
        </>}
    </>;
};

export default ClaimAd;
