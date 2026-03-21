import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Bot, Send, Minus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Xin chào! Tôi là RT Bot. Bạn cần tìm điện thoại, laptop hay linh kiện gì?", sender: "bot" }
    ]);
    
    const scrollRef = useRef(null);
    const navigate = useNavigate();

    // 1. Cố định Session ID (Giữ nguyên logic cũ rất tốt)
    const sessionId = useMemo(() => {
        let id = sessionStorage.getItem("rasa_session_id");
        if (!id) {
            id = `user_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem("rasa_session_id", id);
        }
        return id;
    }, []);

    // 2. Auto Scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [messages, isTyping, isOpen]);

    // 3. Hàm gửi tin nhắn qua REST API
    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: "user" };
        setMessages(prev => [...prev, userMsg]);
        
        const currentInput = input;
        setInput("");
        setIsTyping(true); // Hiển thị trạng thái Bot đang xử lý

        try {
            const response = await fetch("http://localhost:5005/webhooks/rest/webhook", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sender: sessionId,
                    message: currentInput
                })
            });

            if (!response.ok) throw new Error("Server Rasa không phản hồi");

            const data = await response.json();
            
            // Đợi một chút để tạo cảm giác Bot đang suy nghĩ
            setTimeout(() => {
                if (data && data.length > 0) {
                    data.forEach((msg) => {
                        setMessages(prev => [...prev, {
                            id: Date.now() + Math.random(),
                            text: (msg.text && msg.text !== "None") ? msg.text : null,
                            attachment: msg.attachment || null,
                            sender: "bot"
                        }]);
                    });
                } else {
                    // Trường hợp Rasa hiểu nhưng không có câu trả lời định nghĩa sẵn
                    setMessages(prev => [...prev, {
                        id: Date.now(),
                        text: "Xin lỗi, mình chưa hiểu ý bạn lắm.",
                        sender: "bot"
                    }]);
                }
                setIsTyping(false);
            }, 500);

        } catch (error) {
            console.error("❌ Lỗi kết nối Rasa REST:", error);
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: "Hệ thống đang bảo trì, Ngọc vui lòng thử lại sau nhé!",
                sender: "bot"
            }]);
            setIsTyping(false);
        }
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