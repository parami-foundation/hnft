import { Button, Modal } from 'antd';
import React, { useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { getTwitterOauthUrl } from '../../services/relayer.service';
import MobileDrawer from '../MobileDrawer/MobileDrawer';
import './SigninModal.scss';

export interface SigninModalProps {
    onClose?: () => void;
}

function SigninModal({ onClose }: SigninModalProps) {
    const handleConnectTwitter = async () => {
        const oauthUrl = await getTwitterOauthUrl();

        if (oauthUrl) {
            window.open(oauthUrl);
            // direct oauth
            // window.location.href = oauthUrl;
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
