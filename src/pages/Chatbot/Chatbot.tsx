import React from 'react';
import './Chatbot.scss';
import { MainContainer } from "@minchat/react-chat-ui";

export interface ChatbotProps { }

function Chatbot({ }: ChatbotProps) {
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
                        messages: [
                            {
                                "user": {
                                    "id": "user_1",
                                    "name": "me",
                                },
                                "text": "hi"
                            },
                            {
                                "user": {
                                    "id": "elon_musk",
                                    "name": "Elon",
                                    avatar: 'https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok.jpg'
                                },
                                "text": "Checkout my latest tweet"
                            }
                        ],
                        header: "Elon Musk",
                        currentUserId: "user_1",
                        onSendMessage: (text: string) => {
                            console.log('on send message:', text);
                        },
                        onBack: () => { }
                    }}
                ></MainContainer>
            </div>
        </div>
    </>;
};

export default Chatbot;
