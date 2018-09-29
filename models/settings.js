const mongoose = require('mongoose');

const settingsSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    guildID: String,
    guildName: String,
    guildOwnerID: String,
    prefix: String,
    suggestionsChannel: String,
    suggestionsLogs: String,
    staffSuggestionsChannel: String,
    staffRoles: [{role: String}],
    cmdStatus: String,
    voteEmojis: String
});

module.exports = mongoose.model('Settings', settingsSchema);