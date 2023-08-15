import React, { useEffect, useState } from 'react';
import './AIME.scss';
import { useParams } from 'react-router-dom';
import Chatbot from '../../components/Chatbot/Chatbot';
import { Character, characters } from '../../models/character';
import { getCharaters, queryCharacter } from '../../services/ai.service';
import { notification } from 'antd';

export interface AIMEProps { }

function AIME({ }: AIMEProps) {
    let { handle } = useParams() as { handle: string };
    const [character, setCharacter] = useState<Character>();

    useEffect(() => {
        if (handle) {
            queryCharacter({twitter_handle: handle}).then(character => {
                if (character && character.name) {
                    setCharacter(character);
                } else {
                    notification.warning({
                        message: 'Character not found',
                    })
                }
            })
        }
    }, [handle])

    // useEffect(() => {
    //     getCharaters().then(chars => {
    //         console.log('got characters', chars);
    //     })
    // }, [])

    return <>
        <div className='aime-container'>
            {!character && <>
                Loading...
            </>}
            {character && <>
                <Chatbot character={character}></Chatbot>
            </>}
        </div>
    </>;
};

export default AIME;
