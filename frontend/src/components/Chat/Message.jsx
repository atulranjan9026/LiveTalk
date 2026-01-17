import React from 'react';
import './Chat.css';

const Message = ({ message, isOwnMessage }) => {
    const formatTime = (date) => {
        const messageDate = new Date(date);
        return messageDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`message ${isOwnMessage ? 'own-message' : 'other-message'}`}>
            <div className="message-bubble">
                {message.imageUrl && (
                    <div className="message-image">
                        <img
                            src={`http://localhost:5000${message.imageUrl}`}
                            alt="Shared"
                            loading="lazy"
                        />
                    </div>
                )}
                {message.content && (
                    <div className="message-content">{message.content}</div>
                )}
                <div className="message-time">{formatTime(message.createdAt)}</div>
            </div>
        </div>
    );
};

export default Message;
