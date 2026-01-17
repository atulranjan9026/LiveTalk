const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure only two participants
conversationSchema.pre('save', function (next) {
    if (this.participants.length !== 2) {
        next(new Error('Conversation must have exactly 2 participants'));
    }
    next();
});

// Index for faster queries
conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
