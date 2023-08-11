import React, { useEffect, useState } from 'react';
import styles from './Chatbot.module.scss';
import { useRef } from 'react';
import { SoundFilled, CaretDownOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Character } from '../../models/character';
import { useDynamicContext } from '@dynamic-labs/sdk-react';

export interface ChatbotProps {
    character: Character;
    jwt?: string;
}

// todo: change this
const GREETING = 'Hi, my friend, what brings you here today?';

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

    const [messages, setMessages] = useState<{ name: string, msg: string }[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [inputValue, setInputValue] = useState<string>();
    // const [authToken, setAuthToken] = useState<string>();

    // const getAuthTokenFromStorage = () => {
    //     chrome.storage.sync.get('jwt').then(value => {
    //         console.log('extension: jwt from storage', value);
    //         if (value.jwt) {
    //             setAuthToken(value.jwt);
    //         }
    //     });
    // }

    // useEffect(() => {
    //     // todo: remove this?
    //     chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    //         if (request.method === 'jwt') {
    //             setAuthToken(request.jwt);
    //         }
    //         return true;
    //     });

    //     getAuthTokenFromStorage();
    // }, []);

    const { authToken, setShowAuthFlow } = useDynamicContext();

    // useEffect(() => {
    //     window.addEventListener('message', (event) => {
    //         if (event.origin !== 'https://hnft.parami.io' && event.origin !== 'http://localhost') {
    //             return;
    //         }
    //         if (event.data) {
    //             if (typeof event.data.startsWith === 'function' && event.data.startsWith(`parami`)) {
    //                 // try get token from storage
    //                 getAuthTokenFromStorage();
    //             }
    //         }
    //     });
    // }, [])

    const [questionOption, setQuestionOption] = useState<string>();

    const pickOneQuestion = (options: string[]) => {
        const randomIndex = Math.floor(Math.random() * options.length);
        const option = options[randomIndex];
        return option;
    }

    useEffect(() => {
        const question = pickOneQuestion(character.questions);
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
        // chatWindow.value = "";
        const clientId = Math.floor(Math.random() * 1010000);
        // var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
        const ws_scheme = "wss";
        const ws_path = ws_scheme + '://' + `${wsEndpoint}` + `/ws/${clientId}?token=${authToken}`;
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
                    selectCharacter();
                    // setLoading(false);
                } else if (message.startsWith(GREETING)) {
                    // mock user first message
                    socket.send('Who are you?');
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

    const selectCharacter = () => {
        socket.send(character.id);
    }

    useEffect(() => {
        if (authToken) {
            console.log('authToken:', authToken);
            console.log('connecting ws...');
            connectSocket(authToken);
        }
    }, [authToken])

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
                    <img className={`${styles.background}`} src={character.background} referrerPolicy='no-referrer'></img>
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
                            <img className={`${styles.tokenIcon}`} src={character.tokenIcon} referrerPolicy='no-referrer'></img>
                            <div className={`${styles.tokenPrice}`}>
                                86 ETH
                            </div>
                            <div className={`${styles.dropdownArrow}`}>
                                <CaretDownOutlined />
                            </div>
                        </div>
                    </div>

                    <div className={`${styles.chat}`}>
                        {!!authToken && <>
                            <div className={`${styles.messageListContainer}`} ref={msgList}>
                                <div className={`${styles.messages}`}>
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
                        </>}
                    </div>

                    <div className={`${styles.footer}`}>
                        {!authToken && <>
                            <div className={`${styles.button}`} onClick={() => {
                                setShowAuthFlow(true);
                            }}>
                                Connect Wallet to Talk
                            </div>
                        </>}

                        {!!authToken && <>
                            <div className={`${styles.button} ${styles.questionOption}`} onClick={() => {
                                if (questionOption) {
                                    handleSendMessage(questionOption);
                                }
                                const question = pickOneQuestion(character.questions);
                                setQuestionOption(question);
                            }}>
                                <div>{questionOption}</div>
                                <div className={`${styles.icon}`}>
                                    <ArrowRightOutlined />
                                </div>
                            </div>
                        </>}
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
