const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Song title is required'],
        trim: true
    },
    artist: {
        type: String,
        required: [true, 'Artist name is required'],
        trim: true
    },
    audioUrl: {
        type: String,
        required: [true, 'Audio URL is required']
    },
    coverImage: {
        type: String,
        default: 'https://via.placeholder.com/150'
    },
    duration: {
        type: String // e.g., "3:45"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Track', trackSchema);

