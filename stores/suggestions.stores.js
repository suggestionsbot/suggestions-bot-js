const mongoose = require('mongoose');
const { Suggestion } = require('../models');
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
            this.client.logger.error(err.stack);
        }

        let required = false;

        if (gSettings.responseRequired) required = true;
        else required = false;

        return required;
    }

    // handles the creation of a suggestion in the database
    async submitGuildSuggestion(suggestion) {
        let submitted = suggestion;
        let defaults = { _id: mongoose.Types.ObjectId() };
        let merged = Object.assign(defaults, submitted);

        const newSuggestion = await new Suggestion(merged);
        return newSuggestion.save().then(res => this.client.logger.log(`New suggestion: \n ${res}`));
    }

    // handles the approval/rejection of a suggestion in the database
    async handleGuildSuggestion(suggestion) {
        let { 
            query,
            status,
            statusUpdated,
            statusReply,
            staffMemberID,
            staffMemberUsername,
            newResults
         } = suggestion;

        let guildSuggestion = await Suggestion.findOne({ $and: query });
        let { guildID, guildName, sID } = guildSuggestion;
        let updatedData = {
            status,
            statusUpdated,
            statusReply,
            staffMemberID,
            staffMemberUsername,
            newResults
        };

        await guildSuggestion.updateOne(updatedData);
        switch (status) {
            case 'approved':
                this.client.logger.log(`sID ${sID} has been approved in the guild "${guildName}" (${guildID}).`);
                if (statusReply) this.client.logger.log(`sID ${sID} has been approved in the guild "${guildName}" (${guildID}) with the response "${statusReply}".`);
                break;
            case 'rejected':
                this.client.logger.log(`sID ${sID} has been rejected in the guild "${guildName}" (${guildID}).`);
                if (statusReply) this.client.logger.log(`sID ${sID} has been rejected in the guild "${guildName}" (${guildID}) with the response "${statusReply}".`);
                break;
            default:
                break;
        }
        return;
    }

    // handles adding notes to a suggestion in the database
    async addGuildSuggestionNote(suggestion) {
        let { query, note } = suggestion;
        let { staffMemberID, staffMemberUsername } = note;
        let guildSuggestion = await Suggestion.findOne({ $and: query });
        let { guildID, guildName, sID } = guildSuggestion;
        let updatedData = { notes: note };

        await guildSuggestion.updateOne({ $push: updatedData });
        return this.client.logger.log(`sID ${sID} had a note added by ${staffMemberUsername} (${staffMemberID}) "${guildName}" (${guildID}).`);
    }
};