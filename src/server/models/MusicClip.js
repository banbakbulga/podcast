const mongoose = require('mongoose');

const musicClipSchema = new mongoose.Schema({
    clipId: {
        type: String,
        required: true,
        unique: true,
        ref: 'Clip'
    },
    music: [{
        title: {
            type: String,
            required: true
        },
        artist: {
            type: String,
            required: true
        },
        album: String,
        year: Number,
        spotifyId: String,
        startTime: Number,
        endTime: Number
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('MusicClip', musicClipSchema); 