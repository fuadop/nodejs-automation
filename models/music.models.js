const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
        unique: true
    },
    artist: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Music', musicSchema);