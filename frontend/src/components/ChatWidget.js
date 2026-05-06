import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from '../api/axiosConfig';
import './ChatWidget.css';

const SOCKET_URL = 'http://localhost:5001';

const ChatWidget = ({ currentUser, receiverId, receiverType, isAdmin = false }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const socketRef = useRef();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!currentUser || !currentUser.id || !receiverId) return;

        console.log(`[Chat] Initializing socket for ${isAdmin ? 'admin' : 'user'} ${currentUser.id}`);
        socketRef.current = io(SOCKET_URL);

        // Join personal room
        const myRoom = `${isAdmin ? 'admin' : 'user'}_${currentUser.id}`;
        socketRef.current.emit('join', myRoom);
        console.log(`[Chat] Joined room: ${myRoom}`);

        // Fetch history
        fetchHistory();

        // Listen for messages
        socketRef.current.on('receive_message', (message) => {
            console.log('[Chat] Received message:', message);
            // Loose equality check for IDs
            if (String(message.sender_id) === String(receiverId) && message.sender_type === receiverType) {
                setMessages((prev) => [...prev, message]);
                if (!isOpen && !isAdmin) setUnreadCount((prev) => prev + 1);
            }
        });

        socketRef.current.on('message_sent', (message) => {
            console.log('[Chat] Message sent confirmation:', message);
            if (String(message.receiver_id) === String(receiverId) && message.receiver_type === receiverType) {
                setMessages((prev) => [...prev, message]);
            }
        });

        return () => {
            if (socketRef.current) {
                console.log('[Chat] Disconnecting socket');
                socketRef.current.disconnect();
            }
        };
    }, [currentUser.id, receiverId, receiverType, isAdmin]);

    useEffect(() => {
        if (isOpen || isAdmin) {
            scrollToBottom();
        }
    }, [messages, isOpen, isAdmin]);

    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
        }
    }, [isOpen]);

    const fetchHistory = async () => {
        try {
            console.log(`[Chat] Fetching history for ${currentUser.id} and ${receiverId}`);
            const response = await axios.post('/chat/history', {
                sender_id: currentUser.id,
                sender_type: isAdmin ? 'admin' : 'user',
                receiver_id: receiverId,
                receiver_type: receiverType
            });
            if (response.data.success) {
                setMessages(response.data.messages);
                console.log(`[Chat] History fetched: ${response.data.messages.length} messages`);
            }
        } catch (err) {
            console.error('[Chat] Error fetching history:', err);
        }
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const messageData = {
            sender_id: currentUser.id,
            sender_type: isAdmin ? 'admin' : 'user',
            receiver_id: receiverId,
            receiver_type: receiverType,
            message: input
        };

        console.log('[Chat] Sending message:', messageData);
        socketRef.current.emit('send_message', messageData);
        setInput('');
    };

    return (
        <div className={`chat-widget ${isOpen ? 'open' : ''} ${isAdmin ? 'admin-mode' : ''}`}>
            {!isOpen && !isAdmin && (
                <button className="chat-toggle" onClick={() => setIsOpen(true)}>
                    <span role="img" aria-label="chat">💬</span>
                    {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                </button>
            )}

            {(isOpen || isAdmin) && (
                <div className="chat-container">
                    <div className="chat-header">
                        <h3>{isAdmin ? `Chatting with Client` : 'GlamConnect Support'}</h3>
                        {!isAdmin && <button onClick={() => setIsOpen(false)}>×</button>}
                    </div>
                    <div className="chat-messages">
                        {messages.length === 0 && <div className="no-messages">No messages yet. Start the conversation!</div>}
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${String(msg.sender_id) === String(currentUser.id) && msg.sender_type === (isAdmin ? 'admin' : 'user') ? 'sent' : 'received'}`}>
                                <div className="message-content">
                                    {msg.message}
                                </div>
                                <div className="message-time">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <form className="chat-input" onSubmit={sendMessage}>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit">Send</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
