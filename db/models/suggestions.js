const mongoose = require('mongoose');

const suggestionSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  guildID: String,
  userID: String,
  messageID: String,
  suggestion: String,
  sID: String,
  time: Number,
  newTime: Number,
  status: String,
  newStatusUpdated: Number,
  statusUpdated: Number,
  statusReply: String,
  staffMemberID: String,
  results: [{ emoji: String, count: Number }],
  newResults: [{ emoji: String, count: Number }],
  notes: [{
    note: String,
    staffMemberID: String,
    staffMemberUsername: String,
    noteAdded: Number,
    newNoteAdded: Number
  }],
  edits: [{
    edit: String,
    username: String,
    userID: String,
    edited: Number,
    newEdited: Number
  }]
});

module.exports = mongoose.model('Suggestion', suggestionSchema);
