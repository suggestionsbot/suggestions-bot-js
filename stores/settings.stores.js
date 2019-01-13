const mongoose = require('mongoose');
const { Blacklist, Command, Settings, Suggestion } = require('../models');
const ErrorHandler = require('../utils/handlers');

module.exports = class SettingsStore {
    constructor(client) {
        this.client = client;
    }

    /* SETTINGS FUNCTIONS
    These functions are used by any and all location in the bot that wants to either
    read the current *complete* guild settings (default + overrides, merged) or that
    wants to change settings for a specific guild.
    */

    // getSettings gets the guild settings in MongoDB
    async getSettings(guild) {
        let gSettings = await Settings.findOne({ guildID: guild.id }) || this.client.config.defaultSettings;
        let check = await this.client.isEmpty(gSettings);

        if (!check) return gSettings;
        else throw ErrorHandler.NoGuildSettings;
    }

    // writeSettings overrides, or adds, any configuration item that is different
    // than the current guild schema. This allows me to write fewer lines of code!
    async writeSettings(guild, newSettings) {
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

    // handles the addition and removal of staff roles
    async updateGuildStaffRoles(guild) {
        let { query, staffRoles, added } = guild;
        let guildSettings = await Settings.findOne(query);
        let updatedData = { staffRoles };
        if (added === true) return await guildSettings.updateOne({ $push: updatedData });
        else return await guildSettings.updateOne({ $pull: updatedData });
    }

    // handles the creation of a guild settings
    async createGuildSettings(guild) {
        let submitted = guild;
        let defaults = { _id: mongoose.Types.ObjectId() };
        let merged = Object.assign(defaults, submitted); // make this into a global function

        const newSettings = await new Settings(merged);
        return newSettings.save().then(this.client.logger.log(`Default settings saved for guild ${merged.guildName} (${merged.guildID})`));
    }

    // handles the removal of guild data
    // figure out why hash is outputted for guild ID instead of actual ID (maybe has to do with cache?)
    async removeGuildData(guild) {
        await Settings.findOneAndDelete({ 
            $or: [
                { guildID: guild.id },
                { guildID: guild.guildID }
            ]
        }, (err, res) => {
            if (err) this.client.logger.error(err.stack);
            
            this.client.logger.log(`Settings data deleted for guild ${guild.guildName || guild.guildName} (${guild.id || guild.guildID})`);
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

    // gets all documents in the settings collection
    async getAllSettings() {
        return await Settings.find({});
    }
};