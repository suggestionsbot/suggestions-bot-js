const mongoose = require('mongoose');

const blacklistSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  guildID: String,
  userID: String,
  reason: String,
  issuerID: String,
  time: Number,
  newTime: Number,
  status: Boolean,
  case: String,
  scope: {
    type: String,
    enum: ['guild', 'global'],
    default: 'guild'
  }
});

module.exports = mongoose.model('Blacklist', blacklistSchema);
