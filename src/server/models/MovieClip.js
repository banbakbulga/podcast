const mongoose = require('mongoose');

const movieClipSchema = new mongoose.Schema({
    clipId: {
        type: String,
        required: true,
        unique: true,
        ref: 'Clip'
    },
    movie: {
        title: {
            type: String,
            required: true
        },
        year: Number,
        director: String,
        imdbId: String,
        poster: String,
        plot: String,
        rating: Number
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MovieClip', movieClipSchema); 