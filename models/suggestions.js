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
    statusReply: String,
    staffMemberID: String,
    staffMemberUsername: String,
    // results: String,
    results: [{ emoji: String, count: Number }],
    note: String,
    noteAdded: String
});

module.exports = mongoose.model('Suggestion', suggestionSchema);