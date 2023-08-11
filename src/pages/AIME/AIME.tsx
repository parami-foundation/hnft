import React, { useEffect, useState } from 'react';
import './AIME.scss';
import { useParams } from 'react-router-dom';
import Chatbot from '../../components/Chatbot/Chatbot';
import { Character, characters } from '../../models/character';

export interface AIMEProps { }

function AIME({ }: AIMEProps) {
    let { handle } = useParams() as { handle: string };
    const [character, setCharacter] = useState<Character>();

    useEffect(() => {
        if (handle) {
            // todo: load character from server
            const character = characters.find(c => c.handle && c.handle.toLowerCase() === handle.toLowerCase());
            if (character) {
                setCharacter(character);
            }
        }
    }, [handle])

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
