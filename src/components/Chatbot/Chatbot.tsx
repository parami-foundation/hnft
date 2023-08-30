import React, { useEffect, useState } from 'react';
import styles from './Chatbot.module.scss';
import { useRef } from 'react';
import { SoundFilled, CaretDownOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Character, characters } from '../../models/character';
import { getChatHistory } from '../../services/ai.service';
import { useAuth } from '@clerk/clerk-react';
import { getAuthToken } from '@dynamic-labs/sdk-react';

export interface ChatbotProps {
    character: Character;
}

// todo: change this
const GREETING = 'Hi, my friend, what brings you here today?';

// todo: remove mock message
const MOCK_FIRST_MSG = 'Who are you?';

let socket: WebSocket;

let wsEndpoint = 'ai.parami.io';

const endMarkerPattern = /\[end(?:=[^\]]*)?\]/;

const isMessageEnd = (msg: string) => {
    return msg && endMarkerPattern.test(msg);
}

const removeEndMarker = (msg: string) => {
    return msg.replace(endMarkerPattern, '');
}

function Chatbot({ character }: ChatbotProps) {
    const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
    const [audioQueue, setAudioQueue] = useState<any[]>([]);
    const [currentAudio, setCurrentAudio] = useState<any>();
    const audioPlayer = useRef<HTMLAudioElement>(null);
    const msgList = useRef<HTMLDivElement>(null);

    const [historyMessages, setHistoryMessages] = useState<{ name: string, msg: string }[]>([]);
    const [messages, setMessages] = useState<{ name: string, msg: string }[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [inputValue, setInputValue] = useState<string>();
    const { getToken } = useAuth();

    const characterInfo = characters.find(c => c.name === character.name);

    const [questionOption, setQuestionOption] = useState<string>();

    const pickOneQuestion = (options: string[]) => {
        const randomIndex = Math.floor(Math.random() * options.length);
        const option = options[randomIndex];
        return option;
    }

    useEffect(() => {
        const question = pickOneQuestion(characterInfo?.questions ?? [`What's up?`]);
        setQuestionOption(question);
    }, []);

    const scrollDown = () => {
        if (msgList.current) {
            msgList.current.scrollTop = msgList.current.scrollHeight;
        }
    }

    const handleMessageStream = (msg: string) => {
        setNewMessage(prevMessage => prevMessage + msg);
        scrollDown();
    }

    useEffect(() => {
        if (isMessageEnd(newMessage)) {
            const newMsg = removeEndMarker(newMessage);
            if (newMsg) {
                setMessages([
                    ...messages,
                    {
                        name: character.name[0], // todo: config this?
                        msg: newMsg
                    }
                ])
            }
            setNewMessage('');
        }
    }, [newMessage]);

    const connectSocket = (authToken: string) => {
        const clientId = Math.floor(Math.random() * 1010000);
        // var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
        const ws_scheme = "wss";
        const ws_path = `${ws_scheme}://${wsEndpoint}/ws/${clientId}?token=${authToken}&character_id=${character.character_id}`;
        socket = new WebSocket(ws_path);
        socket.binaryType = 'arraybuffer';

        socket.onopen = (event) => {
            console.log("successfully connected");
            socket.send("web"); // select web as the platform
        };

        socket.onmessage = (event) => {
            console.log('Message from server');
            if (typeof event.data === 'string') {
                const message = event.data;
                console.log('[message]', message);
                if (message.startsWith('Select')) {
                    // todo: no need to select charater
                } else if (message.startsWith(GREETING)) {
                    // mock user first message
                    socket.send(MOCK_FIRST_MSG);
                } else if (message.startsWith('[+]')) {
                    // [+] indicates the transcription is done. stop playing audio
                    //   chatWindow.value += `\nYou> ${message}\n`;
                    //   stopAudioPlayback();
                } else if (message.startsWith('[=]')) {
                    //   // [=] indicates the response is done
                    //   chatWindow.value += "\n\n";
                    //   chatWindow.scrollTop = chatWindow.scrollHeight;
                } else {
                    // message response
                    handleMessageStream(message);
                }
            } else {  // binary data
                console.log('[binary data]', event.data);
                setAudioQueue([...audioQueue, event.data]);
            }
        };

        socket.onerror = (error) => {
            console.log(`WebSocket Error: `, error);
            // setAuthToken(undefined);
        };

        socket.onclose = (event) => {
            console.log("Socket closed", event);
        };
    }

    useEffect(() => {
        getToken().then(authToken => {
            if (authToken) {
                console.log('connecting ws...');
                connectSocket(authToken);

                getChatHistory(authToken, character.character_id).then(res => {
                    if (res?.length) {
                        const messages = [] as { name: string, msg: string }[];
                        res.filter(chatHistory => {
                            return chatHistory.client_message_unicode !== MOCK_FIRST_MSG
                        }).forEach(chat => {
                            messages.push({
                                name: 'Y',
                                msg: chat.client_message_unicode
                            });
                            messages.push({
                                name: character.name[0],
                                msg: chat.server_message_unicode
                            });
                        })
                        console.log('loaded history messages', messages);
                        setHistoryMessages(messages);
                    }
                })
            }
        });
    }, [])

    useEffect(() => {
        if (audioQueue.length > 0 && !currentAudio) {
            setCurrentAudio(audioQueue[0]);
            setAudioQueue(audioQueue.slice(1));
        }
    }, [audioQueue, currentAudio]);

    useEffect(() => {
        if (currentAudio && audioEnabled) {
            playAudio(currentAudio).then(res => {
                setCurrentAudio(undefined);
            })
        }
    }, [currentAudio, audioEnabled])

    const playAudio = (data: any) => {
        let blob = new Blob([data], { type: 'audio/mp3' } as any);
        let audioUrl = URL.createObjectURL(blob);
        const player = audioPlayer.current as HTMLAudioElement;
        return new Promise((resolve) => {
            player.src = audioUrl;
            player.muted = true;  // Start muted
            player.onended = resolve;
            player.play().then(() => {
                player.muted = false;  // Unmute after playback starts
            }).catch(error => alert(`Playback failed because: ${error}`));
        });
    }

    const handleSendMessage = async (text: string) => {
        setMessages([
            ...messages,
            {
                name: 'Y',
                msg: text
            }
        ]);
        socket.send(text);
    }

    useEffect(() => {
        scrollDown();
    }, [messages])

    return <>
        <div className={`${styles.chatbotContainer}`}>
            {character && <>
                <div className={`${styles.backgroundContainer}`}>
                    <img className={`${styles.background}`} src={characterInfo?.background} referrerPolicy='no-referrer'></img>
                </div>
                <div className={`${styles.contentContainer}`}>
                    <div className={`${styles.header}`}>
                        <div className={`${styles.name}`}>
                            {character.name}

                            <div className={`${styles.audioButton}`} onClick={() => {
                                setAudioEnabled(true);
                            }}>
                                <SoundFilled />
                            </div>
                        </div>

                        <div className={`${styles.token}`}>
                            <img className={`${styles.tokenIcon}`} src={characterInfo?.tokenIcon} referrerPolicy='no-referrer'></img>
                            <div className={`${styles.tokenPrice}`}>
                                86 ETH
                            </div>
                            <div className={`${styles.dropdownArrow}`}>
                                <CaretDownOutlined />
                            </div>
                        </div>
                    </div>

                    <div className={`${styles.chat}`}>
                        <div className={`${styles.messageListContainer}`} ref={msgList}>
                            <div className={`${styles.messages}`}>
                                {historyMessages.length > 0 && <>
                                    {historyMessages.map(message => {
                                        return <>
                                            <div className={`${styles.message}`}>
                                                {message.name}: {message.msg}
                                            </div>
                                        </>
                                    })}
                                </>}

                                {messages.length > 0 && <>
                                    {messages.map(message => {
                                        return <>
                                            <div className={`${styles.message}`}>
                                                {message.name}: {message.msg}
                                            </div>
                                        </>
                                    })}
                                </>}

                                {newMessage.length > 0 && <>
                                    <div className={`${styles.message}`}>
                                        {character.name[0]}: {newMessage}
                                    </div>
                                </>}
                            </div>
                        </div>
                        <div className={`${styles.messageInput}`}>
                            <input className={`${styles.textInput}`} value={inputValue} autoFocus={true}
                                onChange={(event) => {
                                    setInputValue(event.target.value);
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                        const msg = (event.target as HTMLInputElement).value;
                                        setInputValue('');
                                        handleSendMessage(msg);
                                    }
                                }}
                            ></input>
                        </div>
                    </div>

                    <div className={`${styles.footer}`}>
                        <div className={`${styles.button} ${styles.questionOption}`} onClick={() => {
                            if (questionOption) {
                                handleSendMessage(questionOption);
                            }
                            const question = pickOneQuestion(characterInfo?.questions ?? [`Sir wen moon?`]);
                            setQuestionOption(question);
                        }}>
                            <div>{questionOption}</div>
                            <div className={`${styles.icon}`}>
                                <ArrowRightOutlined />
                            </div>
                        </div>
                    </div>
                </div>
            </>}

            <div className={`${styles.audioContainer}`}>
                <audio className="audio-player" ref={audioPlayer}>
                    <source src="" type="audio/mp3" />
                </audio>
            </div>
        </div>
    </>;
};

export default Chatbot;
