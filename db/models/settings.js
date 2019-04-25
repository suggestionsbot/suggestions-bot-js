const mongoose = require('mongoose');
const { defaultSettings } = require('../../config');

const settingsSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    guildID: String,
    guildName: String,
    guildOwnerID: String,
    prefix: {
        type: String,
        default: defaultSettings.prefix
    },
    suggestionsChannel: {
        type: String,
        default: defaultSettings.suggestionsChannel
    },
    suggestionsLogs: String,
    staffSuggestionsChannel: String,
    staffRoles: [{ role: String }],
    voteEmojis: String,
    responseRequired: {
        type: Boolean,
        default: false
    },
    dmResponses: {
        type: Boolean,
        default: true
    },
    disabledCommands: [{
        command: String,
        added: Number,
        addedByUsername: String,
        addedByUserID: String
    }]
});

module.exports = mongoose.model('Settings', settingsSchema);