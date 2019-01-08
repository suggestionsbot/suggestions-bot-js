const Settings = require('../models/settings');
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

        return await Settings.findOneAndUpdate({ guildID: guild.id }, settings).catch(err => this.logger.error(err));
    }
};