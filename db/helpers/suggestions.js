const mongoose = require('mongoose');
const { oneLine } = require('common-tags');
const { Suggestion } = require('../models');

module.exports = class SuggestionsHelpers {
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
        const data = await Suggestion
            .findOne({ $and: [{ guildID: guild.id, sID: sID }] });
        
        return data;
    }

    /**
     * Get a suggestion globally from the database (for administrative use).
     * 
     * @param {String} sID - The unique suggestion ID.
     */
    async getGlobalSuggestion(sID) {
        const data = await Suggestion
            .findOne({ sID: sID });

        return data;
    }

    /**
     * Get all the suggestions of a specific guild from the database.
     * 
     * @param {Object} guild - The guild object.
     */
    async getGuildSuggestions(guild) {
        const data = await Suggestion
            .find({ guildID: guild.id });

        return data;
    }

    /**
     * Get a specific guild member's suggestions from the database.
     * 
     * @param {Object} guild - The guild object.
     * @param {Object} member - The member object.
     */
    async getGuildMemberSuggestions(guild, member) {
        const data = await Suggestion
            .find({ $and: [{ guildID: guild.id, userID: member.id }] })
            .sort({ time: -1 });

        return data;
    }

    /**
     * Get a specific user's global suggestions data from the database.
     * 
     * @param {Object} user - The user object. 
     */
    async getUserGlobalSuggestions(user) {
        const data = await Suggestion
            .find({ userID: user.id })
            .sort({ _id: -1 });

        return data;
    }

    /**
     * Check if a guild requirees a response or not when rejecting suggestions.
     * 
     * @param {Object} guild - The guild object.
     */
    async isResponseRequired(guild) {
        const { responseRequired } = await this.client.settings.getGuild(guild);

        if (responseRequired) return true;
        else return false;
    }

    /**
     * Create a new guild suggestion in the database.
     * 
     * @param {Object} suggestion - The suggestion object.
     */
    async submitGuildSuggestion(suggestion) {
        const defaults = { _id: mongoose.Types.ObjectId() };
        const merged = Object.assign(defaults, suggestion);

        const newSuggestion = await new Suggestion(merged);
        const data = await newSuggestion.save();
        this.client.logger.log(`New suggestion submitted by "${data.username}" (${data.userID}) in the guild "${data.guildName}" (${data.userID})`);
        return data;
    }

    /**
     * Approve or reject a guild suggestion in the database.
     * 
     * @param {Object} suggestion - The suggestion object.
     */
    async handleGuildSuggestion(suggestion) {

        const guildSuggestion = await Suggestion.findOne({ $and: suggestion.query });
        const { guildID, guildName, sID } = guildSuggestion;
        const updatedData = {
            status: suggestion.status,
            statusUpdated: suggestion.statusUpdated,
            statusReply: suggestion.statusReply,
            staffMemberID: suggestion.staffMemberID,
            staffMemberUsername: suggestion.staffMemberUsername,
            newResults: suggestion.newResults
        };

        await guildSuggestion.updateOne(updatedData);
        switch (suggestion.status) {
            case 'approved':
                this.client.logger.log(`sID ${sID} has been approved in the guild "${guildName}" (${guildID}).`);
                if (suggestion.statusReply) {
                    this.client.logger.log(oneLine`
                        sID ${sID} has been approved in the guild "${guildName}" (${guildID}) 
                        with the response "${suggestion.statusReply}".
                    `);
                }
                break;
            case 'rejected':
                this.client.logger.log(`sID ${sID} has been rejected in the guild "${guildName}" (${guildID}).`);
                if (suggestion.statusReply) {
                    this.client.logger.log(`
                        sID ${sID} has been rejected in the guild "${guildName}" (${guildID}) 
                        with the response "${suggestion.statusReply}".
                    `);
                }
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