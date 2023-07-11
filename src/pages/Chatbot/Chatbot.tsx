import React, { useEffect, useState } from 'react';
import './Chatbot.scss';
import { MainContainer } from "@minchat/react-chat-ui";
import MessageType from '@minchat/react-chat-ui/dist/MessageType';
import { chatWithSocialAgent, getAgentInfo, getAudioOfText } from '../../services/ai.service';
import { notification } from 'antd';

export interface ChatbotProps { }

const currentUser = {
    "id": "user_1",
    "name": "me",
}

const elonMuskId = 'elon_musk';

const elon = {
    "id": "elon_musk",
    "name": "Elon",
    avatar: 'https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok.jpg'
}

function Chatbot({ }: ChatbotProps) {
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [audioURL, setAudioURL] = useState<string>();
    const [agentInfo, setAgentInfo] = useState<any>();

    const generateNewAudio = async (text: string) => {
        setAudioURL(undefined);
        const audioData = await getAudioOfText(text);
        if (audioData) {
            // Create a new Blob object from the audio data with MIME type 'audio/mpeg'
            const blob = new Blob([audioData as any], { type: 'audio/mpeg' });
            // Create a URL for the blob object
            const url = URL.createObjectURL(blob);
            setAudioURL(url);
        }
    }

    useEffect(() => {
        getAgentInfo(elonMuskId).then(res => {
            setAgentInfo(res);
        })
        chatWithSocialAgent(elonMuskId, '').then(res => {
            if (res.success) {
                generateNewAudio(res.message ?? '');
                setMessages([{
                    user: elon,
                    text: res.message
                }]);
            }
        })
    }, [])

    const handleSendMessage = async (text: string) => {
        const currentMessages = [...messages, {
            user: currentUser,
            text: text
        }]
        setMessages(currentMessages)
        const resp = await chatWithSocialAgent('elon_musk', text);
        if (resp.success) {
            generateNewAudio(resp.message ?? '');
            setMessages([...currentMessages, {
                user: elon,
                text: resp.message
            }]);
        } else {
            notification.warning({
                message: 'Network Error. Please try again later.',
            })
        }
    }

    return <>
        <div className='chatbot-container'>
            <div className='chatbot-content'>
                {agentInfo && <>
                    <div className='agent-background'>
                        <img src={agentInfo.background} referrerPolicy='no-referrer' />
                    </div>
                </>}

                <MainContainer
                    inbox={{
                        onScrollToBottom: () => { },
                        themeColor: "#6ea9d7",
                        conversations: [{
                            id: "1",
                            title: "Elon Musk",
                            avatar: "https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok.jpg",
                            lastMessage: {
                                seen: false,
                                text: "What's up?",
                                user: {
                                    id: "elon",
                                    name: "Elon",
                                }
                            }
                        }],
                        loading: !agentInfo,
                        onConversationClick: () => console.log("onChat click"),
                        selectedConversationId: "1"
                    }}
                    selectedConversation={{
                        themeColor: "#6ea9d7",
                        messages: messages,
                        header: "Elon Musk",
                        currentUserId: "user_1",
                        onSendMessage: handleSendMessage,
                        onBack: () => { }
                    }}
                ></MainContainer>

                <div>
                    {audioURL && (
                        <audio autoPlay controls>
                            <source src={audioURL} type="audio/mpeg" />
                        </audio>
                    )}
                </div>
            </div>
        </div>
    </>;
};

export default Chatbot;
