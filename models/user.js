const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: { type: String, enum: ['admin', 'staff'], default: 'staff' } // Phân quyền
});

module.exports = mongoose.model('User', userSchema);
