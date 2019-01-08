const Suggestion = require('../models/suggestions');
const ErrorHandler = require('../utils/handlers');

module.exports = class SuggestionsStore {
    constructor(client) {
        this.client = client;
    }

    // // this method allows a single suggestion in a guild to be queried
    async getGuildSuggestion(guild, sID) {
        let gSuggestion = await Suggestion.findOne({ $and: [{ guildID: guild.id, sID: sID }] }).catch(err => this.client.logger.error(err.stack));

        const guildSuggestion = gSuggestion || {};
        return guildSuggestion;
    }

    // this method updates a single suggestion in a guild in the database
    // async updateGuildSuggeston(guild, sID, newUpdates) {
    //     let gSuggestion = await Suggestion.findOne({ $and: [{ guildID: guild.id, sID: sID }] }).catch(err => this.client.logger.error(err));

    //     const guildSuggestion = gSuggestion || {};
    //     return guildSuggestion;
    // }

    // this method allows for a single suggestion to be queried, regardless of the guild (for administrative use)
    async getGlobalSuggestion(sID) {
        let gSuggestion = await Suggestion.findOne({ sID: sID }).catch(err => this.client.logger.error(err.stack));

        const globalSuggestion = gSuggestion || {};
        return globalSuggestion;
    }

    // this method gets the guild's suggestions from the database
    async getGuildSuggestions(guild) {
        let gSuggestions = await Suggestion.find({ guildID: guild.id }).catch(err => this.client.logger.error(err.stack));

        const guildSuggestions = gSuggestions || {};
        return guildSuggestions;
    }

    // this method gets the global suggestions from the database
    async getGlobalSuggestions() {
        let gSuggestions = await Suggestion.find({}).catch(err => this.client.logger.error(err.stack));

        let globalSuggestions = gSuggestions || {};
        return globalSuggestions;
    }

    // this method gets a guild member's suggestions in a guild from the database
    async getGuildMemberSuggestions(guild, member) {
        let gSuggestions = await Suggestion
            .find({ $and: [{ guildID: guild.id, userID: member.id }] })
            .sort({ time: -1 })
            .catch(err => this.client.logger.error(err.stack));

        const memberSuggestions = gSuggestions || {};
        return memberSuggestions;
    }

    // checks whether a response is required or not when rejecting suggestions
    async isResponseRequired(guild) {
        let gSettings = {};
        try {
            gSettings = await this.client.settings.getSettings(guild);
        } catch (err) {
            this.logger.error(err.stack);
        }

        let required = false;

        if (gSettings.responseRequired) required = true;
        else required = false;

        return required;
    }
};