import React, { useEffect, useState } from 'react';
import './Chatbot.scss';
import { MainContainer } from "@minchat/react-chat-ui";
import MessageType from '@minchat/react-chat-ui/dist/MessageType';
import { chatWithSocialAgent } from '../../services/ai.service';
import { notification } from 'antd';

export interface ChatbotProps { }

const currentUser = {
    "id": "user_1",
    "name": "me",
}

const elon = {
    "id": "elon_musk",
    "name": "Elon",
    avatar: 'https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok.jpg'
}

function Chatbot({ }: ChatbotProps) {
    const [messages, setMessages] = useState<MessageType[]>([]);

    useEffect(() => {
        chatWithSocialAgent('elon_musk', '').then(res => {
            if (res.success) {
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
                        loading: false,
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
            </div>
        </div>
    </>;
};

export default Chatbot;
