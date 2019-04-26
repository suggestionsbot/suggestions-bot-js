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
    newTime: Number,
    status: String,
    statusUpdated: String,
    newStatusUpdated: Number,
    statusReply: String,
    staffMemberID: String,
    staffMemberUsername: String,
    results: String,
    newResults: [{ emoji: String, count: Number }],
    note: String,
    notes: [{ 
        note: String,
        staffMemberID: String,
        staffMemberUsername: String,
        noteAdded: String,
        newNoteAdded: Number
    }],
    edits: [{
        edit: String,
        username: String,
        userID: String,
        edited: String,
        newEdited: Number
    }],
    noteAdded: String
});

module.exports = mongoose.model('Suggestion', suggestionSchema);