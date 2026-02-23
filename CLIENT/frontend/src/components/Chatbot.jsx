import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minus, Bot, User, Sparkles } from 'lucide-react';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        { id: 1, text: "Xin chào! Tôi là RT Bot. Tôi có thể giúp gì cho bạn hôm nay?", sender: "bot" }
    ]);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const newMsg = { id: Date.now(), text: input, sender: "user" };
        setMessages(prev => [...prev, newMsg]);
        setInput("");

        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "Cảm ơn bạn. Câu hỏi của bạn đã được chuyển đến tư vấn viên. Đợi tôi một chút nhé!",
                sender: "bot"
            }]);
        }, 1000);
    };

    return (
        <div className="chatbot-wrapper" style={{ fontFamily: 'Cabin, sans-serif' }}>
            {/* Nút kích hoạt với Icon Bot */}
            {!isOpen && (
                <button className="chat-trigger-icon" onClick={() => setIsOpen(true)}>
                    <div className="bot-icon-badge">
                        <Bot size={32} />
                        <span className="online-dot"></span>
                    </div>
                </button>
            )}

            {/* Khung Chat RT Bot */}
            {isOpen && (
                <div className="chat-window-modern">
                    <div className="chat-header-modern">
                        <div className="bot-profile">
                            <div className="bot-avatar">
                                <Bot size={20} color="white" />
                            </div>
                            <div className="bot-status">
                                <h3>RT Bot</h3>
                                <p><span>•</span> Đang trực tuyến</p>
                            </div>
                        </div>
                        <div className="header-actions">
                            <button onClick={() => setIsOpen(false)} className="action-btn"><Minus size={18} /></button>
                            <button onClick={() => setIsOpen(false)} className="action-btn"><X size={18} /></button>
                        </div>
                    </div>

                    <div className="chat-body-modern" ref={scrollRef}>
                        {messages.map(msg => (
                            <div key={msg.id} className={`msg-container ${msg.sender}`}>
                                {msg.sender === 'bot' && (
                                    <div className="mini-avatar"><Bot size={14} /></div>
                                )}
                                <div className="bubble-modern">
                                    {msg.text}
                                </div>
                                {msg.sender === 'user' && (
                                    <div className="mini-avatar user-avt"><User size={14} /></div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="chat-footer-modern">
                        <div className="input-wrapper">
                            <input 
                                type="text" 
                                placeholder="Hỏi RT Bot về sản phẩm..." 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button onClick={handleSend} className={`send-icon-btn ${input.trim() ? 'active' : ''}`}>
                                <Send size={20} />
                            </button>
                        </div>
                        <p className="powered-by">Powered by RedTech AI</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;