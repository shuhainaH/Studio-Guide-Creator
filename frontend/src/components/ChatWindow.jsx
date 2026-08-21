import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatWindow = ({ roomName = "global" }) => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const ws = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!isOpen) return;
        
        // Connect to WebSocket
        const socket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomName}/`);
        ws.current = socket;

        socket.onopen = () => {
            console.log('Connected to chat room:', roomName);
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages((prev) => [...prev, data]);
        };

        socket.onclose = () => {
            console.log('Disconnected from chat room');
        };

        return () => {
            socket.close();
        };
    }, [isOpen, roomName]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (inputValue.trim() && ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                message: inputValue,
                username: user ? user.username : 'Guest'
            }));
            setInputValue('');
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="bg-white rounded-2xl shadow-2xl border border-beige-sand w-80 h-96 flex flex-col mb-4 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-brown-900 text-cream px-4 py-3 flex items-center justify-between shadow-md z-10">
                            <div className="flex items-center gap-2">
                                <MessageSquare size={18} className="text-terracotta" />
                                <h3 className="font-bold text-sm">Global Chat</h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-brown-400 hover:text-cream transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        
                        {/* Messages Area */}
                        <div className="flex-1 bg-cream-warm p-4 overflow-y-auto flex flex-col gap-3">
                            {messages.length === 0 ? (
                                <div className="text-center text-brown-400 text-xs mt-10">
                                    Welcome to the chat! Say hello.
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = user && msg.username === user.username;
                                    return (
                                        <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <span className="text-[10px] text-brown-500 font-bold ml-1 mb-0.5">{msg.username}</span>
                                            <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm ${isMe ? 'bg-terracotta text-cream rounded-tr-none' : 'bg-white text-brown-900 border border-beige-sand rounded-tl-none'}`}>
                                                {msg.message}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        
                        {/* Input Area */}
                        <div className="p-3 bg-white border-t border-beige-sand">
                            <form onSubmit={sendMessage} className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-cream border border-beige-sand rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta text-brown-900"
                                />
                                <button 
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    className="bg-brown-900 text-cream p-2 rounded-full hover:bg-brown-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isOpen && (
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="bg-terracotta text-cream p-4 rounded-full shadow-lg shadow-terracotta/40 hover:bg-terracotta-accent transition-colors flex items-center justify-center relative"
                >
                    <MessageSquare size={24} />
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                </motion.button>
            )}
        </div>
    );
};

export default ChatWindow;
