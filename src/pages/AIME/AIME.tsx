import React, { useEffect, useState } from 'react';
import './AIME.scss';
import { useParams } from 'react-router-dom';
import Chatbot from '../../components/Chatbot/Chatbot';
import { Character } from '../../models/character';
import { getCharaters, queryCharacter } from '../../services/ai.service';
import { Button, notification } from 'antd';
import { useAuth, useClerk, useUser } from '@clerk/clerk-react';
import { useAccount, useSignMessage } from 'wagmi';
import { useWeb3Modal } from '@web3modal/react';
import { BIND_WALLET_MESSAGE } from '../../models/aime';

export interface AIMEProps { }

const availableCharaterIds = ['elon_musk', 'justin_sum'];

function AIME({ }: AIMEProps) {
    let { handle } = useParams() as { handle: string };
    const [character, setCharacter] = useState<Character>();
    const [authToken, setAuthToken] = useState<string>();
    const { getToken } = useAuth();
    // const { isSignedIn } = useUser();
    const { signOut, openSignIn } = useClerk();
    const [characters, setCharacters] = useState<Character[]>();
    const [showBindWalletBtn, setShowBindWalletBtn] = useState<boolean>(true);
    const [requestUserSig, setRequestUserSig] = useState<boolean>(false);
    const { open } = useWeb3Modal();
    const { data: signature, error: signMsgError, isLoading: signMsgLoading, signMessage } = useSignMessage();
    const { address, isConnected } = useAccount();


    useEffect(() => {
        if (requestUserSig) {
            if (!isConnected) {
                open().catch(e => console.log(e));
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

    // useEffect(() => {
    //     if (isSignedIn) {
    //         // todo: get token
    //         // getToken().then(token => {
    //         //     if (token) {
    //         //         console.log('token from clerk:', token)
    //         //         setAuthToken(token);
    //         //     }
    //         // })
    //     }
    // }, [isSignedIn])

    useEffect(() => {
        getCharaters().then(characters => {
            setCharacters(characters)
            // setCharacters(characters.filter(char => {
            //     return availableCharaterIds.includes(char.character_id)
            // }))
        })
    }, [])

    useEffect(() => {
        if (handle) {
            queryCharacter({ twitter_handle: handle }).then(character => {
                if (character && character.name) {
                    setCharacter(character);
                } else {
                    // notification.warning({
                    //     message: 'Character not found',
                    // })
                }
            })
        }
    }, [handle])

    const isSignedIn = true;

    return <>
        <div className='aime-container'>
            {!isSignedIn && <>
                <div className='logo-container'>
                    <div className='logo'>
                        {/* <img src='/images/aime_logo.svg' alt='' /> */}
                    </div>
                    <div className='title'>AIME</div>
                    <div className='sub-title'>aime.parami.io</div>
                </div>

                <div className='button-container'>
                    <div className='btn-large' onClick={() => {
                        openSignIn()
                    }}>Login</div>
                </div>
            </>}


            {isSignedIn && <>
                {!character && <>
                    <div className='select-character-container'>
                        <div className='header'>CHOOSE ONE OF THEM TO TALK</div>

                        <div className='characters-container'>
                            {characters && characters.length > 0 && <>
                                {characters.map(char => {
                                    return <>
                                        <div className='character-card'>
                                            <div className='power-balance'>
                                                <div className='power-icon-container'>
                                                    <img src='/images/power_icon.svg' alt=''></img>
                                                </div>
                                                0 Power
                                            </div>
                                            <div className='avatar'>
                                                <img src={char.avatar} alt='' />
                                            </div>
                                            <div className='name-container'>
                                                <div className='name'>
                                                    {char.name}
                                                </div>
                                                <div className='rewards-count'>
                                                    Recieved Rewards: 0
                                                </div>
                                            </div>
                                            <div className='chat-btn' onClick={() => {
                                                setCharacter(char)
                                            }}>
                                                CHAT
                                            </div>
                                        </div>
                                    </>
                                })}
                            </>}
                        </div>

                        <div className='button-container'>
                            <div className='btn-large' onClick={() => {
                            }}>Mint My Own AIME</div>
                        </div>
                    </div>
                </>}

                {character && <>
                    <div className='chat-container'>
                        <Chatbot character={character} ></Chatbot>
                    </div>
                </>}

                {/* {character && authToken && <>
                    
                </>} */}

                {/* {showBindWalletBtn && <>
                    <div style={{ marginBottom: '20px' }}>
                        <Button type='primary' onClick={() => {
                            setRequestUserSig(true);
                        }}>Bind Wallet</Button>
                    </div>
                </>}

                <div>
                    <Button type='primary' onClick={() => {
                        signOut();
                    }}>Sign out</Button>
                </div> */}
            </>}
        </div>
    </>;
};

export default AIME;
