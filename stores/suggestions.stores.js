const mongoose = require('mongoose');
const { Suggestion } = require('../models');

module.exports = class SuggestionsStore {
    constructor(client) {
        this.client = client;
    }

    /**
     * Get a guild suggestion from the database.
     * 
     * @param {Object} guild - The guild object.
     * @param {String} sID - The unique suggestion ID.
     */
    async getGuildSuggestion(guild, sID) {
        let gSuggestion = await Suggestion.findOne({ $and: [{ guildID: guild.id, sID: sID }] }).catch(err => this.client.logger.error(err.stack));

        const guildSuggestion = gSuggestion || {};
        return guildSuggestion;
    }

    /**
     * Get a suggestion globally from the database (for administrative use).
     * 
     * @param {String} sID - The unique suggestion ID.
     */
    async getGlobalSuggestion(sID) {
        let gSuggestion = await Suggestion.findOne({ sID: sID }).catch(err => this.client.logger.error(err.stack));

        const globalSuggestion = gSuggestion || {};
        return globalSuggestion;
    }

    /**
     * Get all the suggestions of a specific guild from the database.
     * 
     * @param {Object} guild - The guild object.
     */
    async getGuildSuggestions(guild) {
        let gSuggestions = await Suggestion.find({ guildID: guild.id }).catch(err => this.client.logger.error(err.stack));

        const guildSuggestions = gSuggestions || {};
        return guildSuggestions;
    }

    /**
     * Get a specific guild member's suggestions from the database.
     * 
     * @param {Object} guild - The guild object.
     * @param {Object} member - The member object.
     */
    async getGuildMemberSuggestions(guild, member) {
        let gSuggestions = await Suggestion
            .find({ $and: [{ guildID: guild.id, userID: member.id }] })
            .sort({ time: -1 })
            .catch(err => this.client.logger.error(err.stack));

        const memberSuggestions = gSuggestions || {};
        return memberSuggestions;
    }

    /**
     * Check if a guild requirees a response or not when rejecting suggestions.
     * 
     * @param {Object} guild - The guild object.
     */
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

    /**
     * Create a new guild suggestion in the database.
     * 
     * @param {Object} suggestion - The suggestion object.
     */
    async submitGuildSuggestion(suggestion) {
        let defaults = { _id: mongoose.Types.ObjectId() };
        let merged = Object.assign(defaults, suggestion);

        const newSuggestion = await new Suggestion(merged);
        return newSuggestion.save().then(res => {
            this.client.logger.log(`New suggestion submitted by "${res.username}" (${res.userID}) in the guild "${res.guildName}" (${res.userID})`);
        });
    }

    /**
     * Approve or reject a guild suggestion in the database.
     * 
     * @param {Object} suggestion - The suggestion object.
     */
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

    /**
     * Add a new note to a guild suggestion in the database.
     * 
     * @param {Object} suggestion - The suggestion object.
     */
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