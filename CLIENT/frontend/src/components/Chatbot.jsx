import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Bot, Send, Minus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false); // Trạng thái Bot đang gõ
    const [messages, setMessages] = useState([
        { id: 1, text: "Xin chào! Tôi là RT Bot. Bạn cần tìm điện thoại, laptop hay linh kiện gì?", sender: "bot" }
    ]);
    
    const scrollRef = useRef(null);
    const navigate = useNavigate();

    // 1. Cố định Session ID
    const sessionId = useMemo(() => {
        let id = sessionStorage.getItem("rasa_session_id");
        if (!id) {
            id = `user_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem("rasa_session_id", id);
        }
        return id;
    }, []);

    // 2. Khởi tạo Socket với cơ chế Reconnect và Transports bắt buộc
    const socket = useMemo(() => io("http://localhost:5005", {
        transports: ["websocket"], // Ép dùng websocket để tránh lỗi polling (403/404)
        upgrade: false,
        reconnectionAttempts: 5,
        query: { session_id: sessionId }
    }), [sessionId]);

    // 3. Auto Scroll mượt mà
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [messages, isTyping, isOpen]);

    useEffect(() => {
        socket.on("connect", () => {
            console.log("✅ Socket Connected:", socket.id);
            socket.emit("session_request", { session_id: sessionId });
        });

        socket.on("connect_error", (err) => {
            console.error("❌ Connection Error:", err.message);
        });

        // 4. Nhận tin nhắn từ Bot
        socket.on("bot_uttered", (message) => {
            console.log("📩 Rasa Response:", message);
            setIsTyping(false); // Dừng hiệu ứng gõ khi nhận được tin

            setMessages(prev => [...prev, {
                id: Date.now() + Math.random(),
                text: (message.text && message.text !== "None") ? message.text : null,
                attachment: message.attachment || null,
                sender: "bot"
            }]);
        });

        return () => {
            socket.off("connect");
            socket.off("connect_error");
            socket.off("bot_uttered");
        };
    }, [socket, sessionId]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: "user" };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true); // Hiển thị "Bot đang gõ..."

        socket.emit("user_uttered", { 
            message: input,
            session_id: sessionId 
        });
        
        setInput("");
    };

    return (
        <div className="chatbot-wrapper" style={{ fontFamily: 'Cabin, sans-serif' }}>
            {!isOpen && (
                <button className="chat-trigger-icon" onClick={() => setIsOpen(true)}>
                    <div className="bot-icon-badge">
                        <Bot size={32} />
                        <span className="online-dot"></span>
                    </div>
                </button>
            )}

            {isOpen && (
                <div className="chat-window-modern">
                    <div className="chat-header-modern">
                        <div className="bot-profile">
                            <div className="bot-avatar"><Bot size={20} color="white" /></div>
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
                            <div key={msg.id} className={`msg-group ${msg.sender}`}>
                                <div className={`msg-container ${msg.sender}`}>
                                    {msg.sender === 'bot' && <div className="mini-avatar"><Bot size={14} /></div>}
                                    {msg.text && <div className="bubble-modern">{msg.text}</div>}
                                </div>

                                {msg.attachment?.type === "product_cards" && (
                                    <div className="product-carousel">
                                        {msg.attachment.data.map((prod, index) => (
                                            <div 
                                                key={`${prod.id}-${index}`} 
                                                className="product-card-bot"
                                                onClick={() => navigate(prod.link)}
                                            >
                                                <div className="card-img">
                                                    <img src={prod.image} alt={prod.name} onError={(e) => e.target.src='https://via.placeholder.com/150'} />
                                                </div>
                                                <div className="card-info">
                                                    <h4>{prod.name}</h4>
                                                    <p className="price">{Number(prod.price).toLocaleString()}đ</p>
                                                    <button className="view-detail">Xem chi tiết</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="msg-group bot">
                                <div className="msg-container bot">
                                    <div className="mini-avatar"><Bot size={14} /></div>
                                    <div className="bubble-modern typing-dots">
                                        <span>.</span><span>.</span><span>.</span>
                                    </div>
                                </div>
                            </div>
                        )}
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;