import React, { useEffect, useState } from 'react';
import './AIME.scss';
import { useParams } from 'react-router-dom';
import Chatbot from '../../components/Chatbot/Chatbot';
import { Character } from '../../models/character';
import { getCharaters, queryCharacter } from '../../services/ai.service';
import { Button } from 'antd';
import { useAuth, useClerk, useUser } from '@clerk/clerk-react';

export interface AIMEProps { }

const availableCharaterIds = ['elon_musk', 'justin_sum'];

function AIME({ }: AIMEProps) {
    let { handle } = useParams() as { handle: string };
    const [character, setCharacter] = useState<Character>();
    const [authToken, setAuthToken] = useState<string>();
    const { getToken } = useAuth();
    const { isSignedIn } = useUser();
    const { signOut, openSignIn } = useClerk();
    const [characters, setCharacters] = useState<Character[]>();

    useEffect(() => {
        if (isSignedIn) {
            getToken().then(token => {
                if (token) {
                    console.log('token from clerk:', token)
                    setAuthToken(token);
                }
            })
        }
    }, [isSignedIn])

    useEffect(() => {
        getCharaters().then(characters => {
            setCharacters(characters.filter(char => {
                return availableCharaterIds.includes(char.character_id)
            }))
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

    return <>
        <div className='aime-container'>
            <div className='logo'>AIME logo</div>

            {!isSignedIn && <>
                <Button type='primary' onClick={() => {
                    openSignIn()
                }}>Sign in</Button>
            </>}

            {isSignedIn && <>
                {!character && <>
                    <h3>Select charater</h3>

                    <div className='characters-container'>
                        {characters && characters.length > 0 && <>
                            {characters.map(char => {
                                return <Button type='primary' onClick={() => {
                                    setCharacter(char);
                                }}>{char.name}</Button>
                            })}
                        </>}
                    </div>
                </>}

                {character && authToken && <>
                    <div className='chat-container'>
                        <Chatbot character={character} ></Chatbot>
                    </div>
                </>}

                <div>
                    <Button type='primary' onClick={() => {
                        signOut();
                    }}>Sign out</Button>
                </div>
            </>}
        </div>
    </>;
};

export default AIME;
