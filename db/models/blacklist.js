const mongoose = require('mongoose');

const blacklistSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    guildID: String,
    guildName: String,
    userID: String,
    username: String,
    reason: String,
    issuerID: String,
    issuerUsername: String,
    time: String,
    status: Boolean,
    case: String,
    scope: String,
});

module.exports = mongoose.model('Blacklist', blacklistSchema);