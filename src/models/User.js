const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        trim: true,
        unique: true
    },
    name: String,
    image: String,
    tokenId: String
});

const User = mongoose.model('User', userSchema);

module.exports = {User};