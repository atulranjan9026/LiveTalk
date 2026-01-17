const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const auth = require('../middleware/auth');
const upload = require('../config/multer');

// Get chat history with a specific user
router.get('/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.userId;

        // Fetch messages between current user and target user
        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: userId },
                { sender: userId, receiver: currentUserId }
            ]
        })
            .populate('sender', 'username email')
            .populate('receiver', 'username email')
            .sort({ createdAt: 1 });

        res.json({ messages });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Server error fetching messages' });
    }
});

// Upload image
router.post('/upload', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const imageUrl = `/uploads/images/${req.file.filename}`;

        res.json({
            message: 'Image uploaded successfully',
            imageUrl
        });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ error: 'Server error uploading image' });
    }
});

// Get conversations
router.get('/conversations/list', auth, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.userId
        })
            .populate('participants', 'username email')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        res.json({ conversations });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ error: 'Server error fetching conversations' });
    }
});

module.exports = router;
