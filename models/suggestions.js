const mongoose = require('mongoose');

const suggestionSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    guildName: String,
    guildID: String,
    username: String,
    userID: String,
    suggestion: String,
    sID: String,
    time: String,
    status: String,
    statusUpdated: String,
    staffMemberID: String,
    staffMemberUsername: String,
    results: String
});

module.exports = mongoose.model('Suggestion', suggestionSchema);