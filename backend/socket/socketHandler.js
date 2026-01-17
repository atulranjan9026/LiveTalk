const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// Store online users
const onlineUsers = new Map();

const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // User joins
        socket.on('user_connected', (userId) => {
            onlineUsers.set(userId, socket.id);
            console.log(`User ${userId} is online`);

            // Broadcast online users to all clients
            io.emit('online_users', Array.from(onlineUsers.keys()));
        });

        // Send message
        socket.on('send_message', async (data) => {
            try {
                const { senderId, receiverId, content, imageUrl, messageType } = data;

                // Create message
                const message = new Message({
                    sender: senderId,
                    receiver: receiverId,
                    content: content || '',
                    imageUrl: imageUrl || '',
                    messageType: messageType || 'text'
                });

                await message.save();

                // Populate sender and receiver info
                await message.populate('sender', 'username email');
                await message.populate('receiver', 'username email');

                // Update or create conversation
                let conversation = await Conversation.findOne({
                    participants: { $all: [senderId, receiverId] }
                });

                if (conversation) {
                    conversation.lastMessage = message._id;
                    conversation.updatedAt = Date.now();
                    await conversation.save();
                } else {
                    conversation = new Conversation({
                        participants: [senderId, receiverId],
                        lastMessage: message._id
                    });
                    await conversation.save();
                }

                // Send to receiver if online
                const receiverSocketId = onlineUsers.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('receive_message', message);
                }

                // Send confirmation to sender
                socket.emit('message_sent', message);
            } catch (error) {
                console.error('Send message error:', error);
                socket.emit('message_error', { error: 'Failed to send message' });
            }
        });

        // Typing indicator
        socket.on('typing', (data) => {
            const { receiverId, isTyping, senderName } = data;
            const receiverSocketId = onlineUsers.get(receiverId);

            if (receiverSocketId) {
                io.to(receiverSocketId).emit('user_typing', {
                    isTyping,
                    senderName
                });
            }
        });

        // User disconnects
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);

            // Remove user from online users
            for (let [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    console.log(`User ${userId} is offline`);
                    break;
                }
            }

            // Broadcast updated online users
            io.emit('online_users', Array.from(onlineUsers.keys()));
        });
    });
};

module.exports = socketHandler;
