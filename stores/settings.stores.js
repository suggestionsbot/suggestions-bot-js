const mongoose = require('mongoose');
const { Blacklist, Command, Settings, Suggestion } = require('../models');

module.exports = class SettingsStore {
    constructor(client) {
        this.client = client;
    }

    /* SETTINGS FUNCTIONS
    These functions are used by any and all location in the bot that wants to either
    read the current *complete* guild settings (default + overrides, merged) or that
    wants to change settings for a specific guild.
    */

    /**
     * Get a guild's settings from the database.
     * 
     * @param {Object} guild - The guild object.
     */
    async getGuild(guild) {
        let gSettings = await Settings.findOne({ guildID: guild.id });
        

        if (gSettings && gSettings._id) return gSettings;
        else return this.client.config.defaultSettings;
    }

    /**
     * Update a guild's settings in the database.
     * 
     * @param {Object} guild - The guild object.
     * @param {Object} newSettings - The settings object to be updated.
     */
    async updateGuild(guild, newSettings) {
        let gSettings = await Settings.findOne({ guildID: guild.id }).catch(err => this.client.logger.error(err.stack));

        let settings = gSettings;
        // maybe check if settings object is empty, return an error?
        if (typeof settings != 'object') settings = {};
        for (const key in newSettings) {
            if (gSettings[key] !== newSettings[key]) settings[key] = newSettings[key];
            else return;
        }

        this.client.logger.log(`Guild "${guild.name}" (${guild.id}) updated settings: \n ${JSON.stringify(newSettings)}`);

        return await Settings.findOneAndUpdate({ guildID: guild.id }, settings).catch(err => this.logger.error(err));
    }

    /**
     * Update a staff role of a guild in the database.
     * 
     * @param {Object} guild - The guild object.
     */
    async updateGuildStaffRoles(guild) {
        let { query, staffRoles, added } = guild;
        let guildSettings = await Settings.findOne(query);
        let updatedData = { staffRoles };
        if (added === true) return await guildSettings.updateOne({ $push: updatedData });
        else return await guildSettings.updateOne({ $pull: updatedData });
    }

    /**
     * Create new settings for a guild in the database.
     * 
     * @param {Object} guild - The guild object.
     */
    async createGuild(guild) {
        let submitted = guild;
        let defaults = { _id: mongoose.Types.ObjectId() };
        let merged = Object.assign(defaults, submitted); // make this into a global function

        const newSettings = await new Settings(merged);
        return newSettings.save().then(this.client.logger.log(`Default settings saved for guild ${merged.guildName} (${merged.guildID})`));
    }

    /**
     * Update the usage for a specific command in the database.
     * 
     * @param {Object} command - The command object.
     * @returns {Promise} - The promise object of the new command.
     */
    async newCommandUsage(command) {
        let submitted = command;
        let defaults = { _id: mongoose.Types.ObjectId() };
        let merged = Object.assign(defaults, submitted);

        const newCommand = await new Command(merged);
        return newCommand.save().then(this.client.logger.log(`${submitted.username} (${submitted.userID}) ran command ${submitted.command}`, 'cmd'));
    }

    /**
     * Remove a guild's data from the database.
     * 
     * @param {Object} guild - The guild object.
     */
    async deleteGuild(guild) {
        await Settings.findOneAndDelete({ 
            $or: [
                { guildID: guild.id },
                { guildID: guild.guildID }
            ]
        }, (err, res) => {
            if (err) this.client.logger.error(err.stack);
            
            this.client.logger.log(`Settings data deleted for guild ${guild.name || guild.guildName} (${guild.id || guild.guildID})`);
        });
    
        await Suggestion.deleteMany({ 
            $or: [
                { guildID: guild.id },
                { guildID: guild.guildID }
            ]
        }, (err, res) => {
            if (err) this.client.logger.error(err.stack);
    
            this.client.logger.log(`Suggestions data deleted for guild ${guild.name || guild.guildName} (${guild.id || guild.guildID})`);
        });
    
        await Command.deleteMany({ 
            $or: [
                { guildID: guild.id },
                { guildID: guild.guildID }
            ]
        }, (err, res) => {
            if (err) this.client.logger.error(err.stack);
    
            this.client.logger.log(`Command data deleted for guild ${guild.name || guild.guildName} (${guild.id || guild.guildID})`);
        });

        await Blacklist.deleteMany({ 
            $or: [
                { guildID: guild.id },
                { guildID: guild.guildID }
            ]
        }, (err, res) => {
            if (err) this.client.logger.error(err.stack);

            this.client.logger.log(`Blacklist data deleted for guild ${guild.name || guild.guildName} (${guild.id || guild.guildID})`);
        });

        return this.client.logger.log(`${this.client.user.username} has left a guild: ${guild.name || guild.guildName } (${guild.id || guild.guildID})`);
    }

    /**
     * Get all documents in the settings collection
     * @returns {Promise}
     */
    async getAllSettings() {
        return await Settings.find({});
    }

    /**
     * Get all documents in the commands collection.
     * @returns {Promise}
     */
    async getAllCommands() {
        return await Command.find({});
    }

    /**
     * Get all documents in the suggestions collection.
     * @returns {Promise}
     */
    async getAllSuggestions() {
        return await Suggestion.find({});
    }

    /**
     * Get all documents in the blacklists collection.
     * @returns {Promise}
     */
    async getAllBlacklists() {
        return await Blacklist.find({});
    }
};