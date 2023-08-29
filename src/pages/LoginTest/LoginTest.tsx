import React, { useEffect, useState } from 'react';
// import { Web3Auth } from "@web3auth/modal";
import { Button, notification } from 'antd';
import { ethers } from "ethers";
import { SignIn, useAuth, useUser, useClerk } from "@clerk/clerk-react";
import { useAccount, useConnect, useNetwork, useSignMessage } from 'wagmi';
import { BIND_WALLET_MESSAGE } from '../../models/aime';
import { useWeb3Modal } from '@web3modal/react';

export interface LoginTestProps { }

function LoginTest({ }: LoginTestProps) {
    // const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
    // const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);

    const [requestUserSig, setRequestUserSig] = useState<boolean>(false);
    const [showBindWalletBtn, setShowBindWalletBtn] = useState<boolean>(false);
    const { isSignedIn, user } = useUser();
    const { isLoaded, userId, sessionId, getToken } = useAuth();
    const { signOut } = useClerk();
    const { data: signature, error: signMsgError, isLoading: signMsgLoading, signMessage } = useSignMessage();
    const { open } = useWeb3Modal();
    const { address, isConnected } = useAccount();

    useEffect(() => {
        if (requestUserSig) {
            if (!isConnected) {
                open();
            } else {
                signMessage({ message: BIND_WALLET_MESSAGE })
            }
        }
    }, [requestUserSig, isConnected])

    useEffect(() => {
        if (signature) {
            console.log('got sig from user', signature);
            notification.success({
                message: 'bind wallet success'
            })
            setShowBindWalletBtn(false);
            setRequestUserSig(false);
        }
    }, [signature])


    useEffect(() => {
        getToken().then(token => {
            console.log('clerk token:', token);
        })
    }, [])

    useEffect(() => {
        if (user) {
            console.log('clerk user:', user);
            if (user.primaryWeb3Wallet) {
                setShowBindWalletBtn(false);
            } else {
                setShowBindWalletBtn(true);
            }
        }
    }, [user])

    return <>
        <div className='login-test-page'>
            {!isSignedIn && <>
                Signing in...
                <SignIn></SignIn>
            </>}
            {isSignedIn && <>
                Welcome!

                {showBindWalletBtn && <>
                    <div>
                        <Button type='primary' onClick={() => {
                            setRequestUserSig(true);
                        }}>Bind Wallet</Button>
                    </div>
                </>}

                <div>
                    <Button type='primary' onClick={() => {
                        signOut();
                    }}>sign out</Button>
                </div>
            </>}
        </div>
    </>;
};

export default LoginTest;
