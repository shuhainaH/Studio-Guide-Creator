import React, { useState, useEffect } from 'react';
import { Search, Send, MoreVertical, Image as ImageIcon, Smile, Check, CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';

import apiClient from '../api/client';
import { useAuth } from '../contexts/AuthContext';

const Messages = () => {
    const { user } = useAuth();
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState([]);
    const location = useLocation();
    const ws = React.useRef(null);
    const activeChatRef = React.useRef(activeChat);

    React.useEffect(() => {
        activeChatRef.current = activeChat;
    }, [activeChat]);

    useEffect(() => {
        const fetchFriendsForChats = async () => {
            try {
                const res = await apiClient.get('social/friends/');
                // Transform friends into chat items
                const friendsChats = res.data.friends.map(f => ({
                    id: f.id,
                    user: f.username,
                    avatar: `https://ui-avatars.com/api/?name=${f.username}&background=random`,
                    lastMessage: 'Say hi!',
                    time: '',
                    unread: 0
                }));
                setChats(friendsChats);
                
                const passedUserId = location.state?.selectedUserId;
                if (passedUserId) {
                    const selected = friendsChats.find(c => c.id === passedUserId);
                    if (selected) setActiveChat(selected);
                } else if (friendsChats.length > 0 && !activeChat) {
                    setActiveChat(friendsChats[0]);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchFriendsForChats();
        
        if (user) {
            ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/social/${user.id}/`);
            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.action === 'direct_message_received') {
                    const msg = data.payload;
                    const msgFormatted = {
                        id: msg.id,
                        text: msg.content,
                        time: new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                        isMe: false
                    };
                    
                    if (activeChatRef.current && activeChatRef.current.id === msg.sender_id) {
                        setMessages(prev => [...prev, msgFormatted]);
                    } else {
                        setChats(prevChats => prevChats.map(c => 
                            c.id === msg.sender_id 
                                ? { ...c, lastMessage: msg.content, unread: c.unread + 1 }
                                : c
                        ));
                    }
                }
            };
        }
        
        return () => {
            if (ws.current) ws.current.close();
        };
    }, [user]);

    useEffect(() => {
        if (!activeChat) return;
        const fetchMessages = async () => {
            try {
                const res = await apiClient.get(`chat/messages/?user_id=${activeChat.id}`);
                setMessages(res.data.map(m => ({
                    id: m.id,
                    text: m.content,
                    time: new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                    isMe: m.sender_id === user.id
                })));
            } catch (e) {
                console.error(e);
            }
        };
        fetchMessages();
    }, [activeChat, user]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if(!messageInput.trim() || !activeChat) return;
        
        try {
            const res = await apiClient.post('chat/messages/', {
                recipient_id: activeChat.id,
                content: messageInput
            });
            setMessages([...messages, {
                id: res.data.id,
                text: res.data.content,
                time: new Date(res.data.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                isMe: true
            }]);
            setMessageInput('');
        } catch (e) {
            console.error(e);
        }
    };

    const parseMessage = (text) => {
        const gameLinkRegex = /\/play\/([\w-]+)/g;
        if (!gameLinkRegex.test(text)) {
            return <p className="text-sm">{text}</p>;
        }
        
        const parts = text.split(gameLinkRegex);
        const elements = [];
        let matchIndex = 1;
        
        // Since we split by regex with 1 group, the array is [text, match, text, match, text]
        for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 0) {
                if (parts[i]) elements.push(<span key={i}>{parts[i]}</span>);
            } else {
                elements.push(
                    <Link key={i} to={`/play/${parts[i]}`} className="inline-block mt-1 bg-white text-terracotta border border-terracotta px-3 py-1 rounded-full text-xs font-bold hover:bg-terracotta hover:text-white transition-colors">
                        ▶ Play {parts[i]}
                    </Link>
                );
            }
        }
        return <div className="text-sm">{elements}</div>;
    };

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col bg-white rounded-3xl shadow-sm border border-beige-sand overflow-hidden">
            <div className="flex flex-1 h-full overflow-hidden">
                
                {/* Left Sidebar - Chat List */}
                <div className="w-full md:w-80 border-r border-beige-sand flex flex-col bg-cream-warm shrink-0">
                    <div className="p-4 border-b border-beige-sand bg-white">
                        <h2 className="text-xl font-black text-brown-900 mb-4">Messages</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search conversations..." 
                                className="w-full bg-cream border border-beige-sand rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-terracotta text-sm text-brown-900"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                        {chats.map(chat => (
                            <div 
                                key={chat.id}
                                onClick={() => setActiveChat(chat)}
                                className={`flex items-center gap-3 p-4 border-b border-beige-sand cursor-pointer transition-colors ${activeChat?.id === chat.id ? 'bg-beige border-l-4 border-l-terracotta' : 'hover:bg-cream'}`}
                            >
                                <img src={chat.avatar} alt={chat.user} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className={`text-sm font-bold truncate ${chat.unread ? 'text-brown-900' : 'text-brown-700'}`}>{chat.user}</h3>
                                        <span className="text-xs font-bold text-brown-400">{chat.time}</span>
                                    </div>
                                    <p className={`text-xs truncate ${chat.unread ? 'font-bold text-brown-900' : 'text-brown-500'}`}>{chat.lastMessage}</p>
                                </div>
                                {chat.unread > 0 && (
                                    <div className="w-5 h-5 bg-terracotta rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                                        {chat.unread}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Area - Chat View */}
                <div className="hidden md:flex flex-1 flex-col bg-cream">
                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            <header className="h-16 bg-white border-b border-beige-sand flex items-center justify-between px-6 shrink-0">
                                <div className="flex items-center gap-3">
                                    <img src={activeChat.avatar} alt={activeChat.user} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <h3 className="font-bold text-brown-900">{activeChat.user}</h3>
                                        <p className="text-xs text-green-500 font-bold">Online</p>
                                    </div>
                                </div>
                                <button className="text-brown-400 hover:text-brown-900 transition-colors">
                                    <MoreVertical size={20} />
                                </button>
                            </header>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.map((msg, i) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={msg.id} 
                                className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                            >
                                <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.isMe ? 'bg-terracotta text-white rounded-br-sm shadow-md' : 'bg-white text-brown-900 border border-beige-sand rounded-bl-sm shadow-sm'}`}>
                                    {parseMessage(msg.text)}
                                </div>
                                <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-brown-400">
                                    <span>{msg.time}</span>
                                    {msg.isMe && <CheckCheck size={12} className="text-terracotta" />}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 bg-white border-t border-beige-sand shrink-0">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-cream-warm border border-beige-sand rounded-full p-1 pl-4 focus-within:ring-2 focus-within:ring-terracotta transition-all">
                            <button type="button" className="text-brown-400 hover:text-brown-900 transition-colors">
                                <Smile size={20} />
                            </button>
                            <button type="button" className="text-brown-400 hover:text-brown-900 transition-colors">
                                <ImageIcon size={20} />
                            </button>
                            <input 
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent border-none focus:outline-none text-sm text-brown-900 px-2"
                            />
                            <button 
                                type="submit" 
                                disabled={!messageInput.trim()}
                                className="w-10 h-10 bg-terracotta disabled:bg-brown-300 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                            >
                                <Send size={16} className="ml-1" />
                            </button>
                        </form>
                    </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-brown-500">
                            Select a friend to start chatting.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
