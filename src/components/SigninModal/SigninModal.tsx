import { Button, Modal } from 'antd';
import React, { useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { useSearchParams } from 'react-router-dom';
import { CLAIM_AD_STATE_PREFIX } from '../../models/hnft';
import { getTwitterOauthUrl } from '../../services/relayer.service';
import MobileDrawer from '../MobileDrawer/MobileDrawer';
import './SigninModal.scss';

export interface SigninModalProps {
    onClose?: () => void;
}

function SigninModal({ onClose }: SigninModalProps) {
    const [params] = useSearchParams();
    const handleConnectTwitter = async () => {
        const bidId = params.get('bidId');
        const oauthUrl = await getTwitterOauthUrl(bidId ? `${CLAIM_AD_STATE_PREFIX}${bidId}` : '');

        if (oauthUrl) {
            window.open(oauthUrl);
        }
    }
    return <>
        {!isMobile && <>
            <Modal
                className='signin-modal'
                open
                centered
                closable={true}
                maskClosable={true}
                footer={null}
                width={472}
                onCancel={onClose}
            >
                <div className='header'>
                    Login
                </div>
                <div className='modal-footer'>
                    <Button onClick={() => {
                        handleConnectTwitter();
                    }} type="primary">
                        <div>
                            Connect Twitter
                        </div>
                    </Button>
                </div>
            </Modal>
        </>}

        {isMobile && <>
            <MobileDrawer onClose={onClose}>
                <div className='drawer-title'>
                    Login
                </div>
                <div className='drawer-btn-container'>
                    <Button onClick={() => {
                        handleConnectTwitter();
                    }} type="primary">
                        <div>
                            Connect Twitter
                        </div>
                    </Button>
                </div>
            </MobileDrawer>
        </>}
    </>;
};

export default SigninModal;
