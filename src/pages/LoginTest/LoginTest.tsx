import React, { useEffect, useState } from 'react';
import { Web3Auth } from "@web3auth/modal";
import { Button } from 'antd';
import { ethers } from "ethers";

export interface LoginTestProps { }

function LoginTest({ }: LoginTestProps) {
    const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
    const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
    const [loggedIn, setLoggedIn] = useState(false);

    const init = async () => {
        //Initialize within your constructor
        const web3auth = new Web3Auth({
            clientId: "BJ9n3fjw9ktpiBEhDmjmXJYjSSukqDKNcksPiXMJ0-OSKqOOvupv9AlUjA_wXqCHftZJCr85e5I8O10hWn6pFT4", // Get your Client ID from Web3Auth Dashboard
            chainConfig: {
                chainNamespace: "eip155",
                chainId: "0x5", // Please use 0x5 for Goerli Testnet
                rpcTarget: "https://rpc.ankr.com/eth_goerli",
            },
            uiConfig: {
                appName: "AIME",
                appLogo: "https://web3auth.io/images/w3a-L-Favicon-1.svg", // Your App Logo Here
                theme: "light",
                loginMethodsOrder: ["twitter", "google", "apple"],
                defaultLanguage: "en", // en, de, ja, ko, zh, es, fr, pt, nl
                loginGridCol: 3,
                // primaryButton: "externalLogin", // "externalLogin" | "socialLogin" | "emailLogin"
            }
        });

        await web3auth.initModal();
        // const web3authProvider = await web3auth.connect();

        if (web3auth.connected) {
            setLoggedIn(true);
        }

        setWeb3auth(web3auth);
    }

    const login = async () => {
        if (!web3auth) {
            console.log("web3auth not initialized yet");
            return;
        }
        try {
            const web3authProvider = await web3auth.connect();
            if (web3authProvider) {
                const provider = new ethers.providers.Web3Provider(web3authProvider, 5);
                setProvider(provider);
            }
        } catch (e) {
            console.log('set provider error', e);
        }
        
        setLoggedIn(true);
    };

    const logout = async () => {
        if (!web3auth) {
            console.log("web3auth not initialized yet");
            return;
        }
        await web3auth.logout();
        setProvider(null);
        setLoggedIn(false)
    };

    useEffect(() => {
        init();
    }, [])

    useEffect(() => {
        if (provider) {
            console.log('we have provider here', provider);
            const signer = provider.getSigner();
            signer.getAddress().then(address => {
                console.log('user address', address);
            });
        }
    }, [provider])

    const authenticateUser = async () => {
        if (!web3auth) {
            console.log("web3auth not initialized yet");
            return;
        }
        const idToken = await web3auth.authenticateUser();
        console.log(idToken);
    };

    const getUserInfo = async () => {
        if (!web3auth) {
            console.log("web3auth not initialized yet");
            return;
        }
        const user = await web3auth.getUserInfo();
        console.log(user);
    };

    // const getAccounts = async () => {
    //     if (!provider) {
    //         console.log("provider not initialized yet");
    //         return;
    //     }
    //     const rpc = new RPC(provider);
    //     const address = await rpc.getAccounts();
    //     uiConsole(address);
    // };

    return <>
        <div className='login-test-page'>
            {loggedIn && <>You have logged in</>}
            {!loggedIn && <>
                <div>
                    <Button type='default' onClick={() => {
                        login();
                    }}>Please Login</Button>
                </div>
            </>}
            <div>
                <Button type='primary' onClick={() => {
                    authenticateUser();
                }}>authenticate</Button>
            </div>
            <div>
                <Button type='primary' onClick={() => {
                    getUserInfo();
                }}>User Info</Button>
            </div>

            <div>
                <Button type='default' onClick={() => {
                    logout();
                }}>Logout</Button>
            </div>
        </div>
    </>;
};

export default LoginTest;
