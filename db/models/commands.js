const mongoose = require('mongoose');

const commandSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  guildID: String,
  guildName: String,
  guildOwnerID: String,
  command: String,
  username: String,
  userID: String,
  channel: String,
  time: String
});

module.exports = mongoose.model('Commands', commandSchema);
