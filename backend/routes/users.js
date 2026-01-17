const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all users except current user
router.get('/', auth, async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.userId } })
            .select('-password')
            .sort({ username: 1 });

        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Server error fetching users' });
    }
});

// Get specific user
router.get('/:userId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error fetching user' });
    }
});

module.exports = router;
