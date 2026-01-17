import React, { useState, useEffect, useRef } from 'react';
import { messagesAPI } from '../../services/api';
import Message from './Message';
import ImagePreview from './ImagePreview';
import './Chat.css';

const ChatWindow = ({ selectedUser, currentUser, socket }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages();
        }
    }, [selectedUser]);

    useEffect(() => {
        if (socket) {
            socket.on('receive_message', (message) => {
                if (
                    message.sender._id === selectedUser?._id ||
                    message.receiver._id === selectedUser?._id
                ) {
                    setMessages((prev) => [...prev, message]);
                }
            });

            socket.on('user_typing', ({ isTyping, senderName }) => {
                setIsTyping(isTyping);
            });

            return () => {
                socket.off('receive_message');
                socket.off('user_typing');
            };
        }
    }, [socket, selectedUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const response = await messagesAPI.getHistory(selectedUser._id);
            setMessages(response.data.messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleTyping = () => {
        if (!socket || !selectedUser) return;

        socket.emit('typing', {
            receiverId: selectedUser._id,
            isTyping: true,
            senderName: currentUser.username
        });

        if (typingTimeout) clearTimeout(typingTimeout);

        const timeout = setTimeout(() => {
            socket.emit('typing', {
                receiverId: selectedUser._id,
                isTyping: false,
                senderName: currentUser.username
            });
        }, 1000);

        setTypingTimeout(timeout);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if ((!newMessage.trim() && !selectedImage) || !socket || !selectedUser) return;

        let imageUrl = '';

        // Upload image if selected
        if (selectedImage) {
            setUploading(true);
            const formData = new FormData();
            formData.append('image', selectedImage);

            try {
                const response = await messagesAPI.uploadImage(formData);
                imageUrl = response.data.imageUrl;
            } catch (error) {
                console.error('Error uploading image:', error);
                setUploading(false);
                return;
            }
            setUploading(false);
        }

        // Send message via socket
        socket.emit('send_message', {
            senderId: currentUser.id,
            receiverId: selectedUser._id,
            content: newMessage.trim(),
            imageUrl,
            messageType: imageUrl ? 'image' : 'text'
        });

        // Add to local state
        const tempMessage = {
            sender: { _id: currentUser.id, username: currentUser.username },
            receiver: { _id: selectedUser._id },
            content: newMessage.trim(),
            imageUrl,
            messageType: imageUrl ? 'image' : 'text',
            createdAt: new Date()
        };

        setMessages((prev) => [...prev, tempMessage]);
        setNewMessage('');
        setSelectedImage(null);
        setImagePreview(null);
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (!selectedUser) {
        return (
            <div className="chat-window-empty">
                <div className="empty-state">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <h2>Select a conversation</h2>
                    <p>Choose a user from the list to start chatting</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-window">
            <div className="chat-header glass-effect">
                <div className="chat-user-info">
                    <div className="user-avatar">
                        {selectedUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3>{selectedUser.username}</h3>
                        {isTyping && <span className="typing-indicator">typing...</span>}
                    </div>
                </div>
            </div>

            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="no-messages">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <Message
                            key={index}
                            message={message}
                            isOwnMessage={message.sender._id === currentUser.id}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {imagePreview && (
                <ImagePreview
                    imageUrl={imagePreview}
                    onRemove={removeImage}
                />
            )}

            <form onSubmit={handleSendMessage} className="message-input-container">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/jpeg,image/jpg,image/png"
                    style={{ display: 'none' }}
                />

                <button
                    type="button"
                    className="btn-icon"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach image"
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                </button>

                <input
                    type="text"
                    className="input-field message-input"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                    }}
                    disabled={uploading}
                />

                <button
                    type="submit"
                    className="btn-send"
                    disabled={(!newMessage.trim() && !selectedImage) || uploading}
                >
                    {uploading ? (
                        <div className="spinner-small"></div>
                    ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
