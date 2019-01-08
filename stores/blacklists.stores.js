const Blacklist = require('../models/blacklist');
const ErrorHandler = require('../utils/handlers');

module.exports = class BlacklistsStore {
    constructor(client) {
        this.client = client;
    }

    // this method gets a guild's blacklist from the database
    async getGuildBlacklist(guild) {
        let gBlacklist;
        try {
            gBlacklist = await Blacklist.find({ guildID: guild.id });
        } catch (err) {
            this.client.logger.error(err.stack);
        }

        const guildBlacklist = gBlacklist || {};
        return guildBlacklist;
    }

    // this method gets the global blacklist from the database
    async getGlobalBlacklist() {
        let gBlacklist;
        try {
            gBlacklist = await Blacklist.find({scope: 'global' });
        } catch (err) {
            this.client.logger.error(err.stack);
        }

        const guildBlacklist = gBlacklist || {};
        return guildBlacklist;
    }

    // this method checks if a user is blacklisted (guild-scoped)
    async checkGuildBlacklist(guild, user) {
        let gBlacklist;
        try {
            gBlacklist = Blacklist.findOne({
                $and: [
                    { guildID: guild.id },
                    { userID: user.id },
                    { status: true }
                ]
            });
        } catch (err) {
            this.client.logger.error(err.stack);
        }

        const guildBlacklist = gBlacklist || {};
        return guildBlacklist;
    }

    // this method checks if a user is blacklisted globally
    async checkGlobalBlacklist(user) {
        let gBlacklist;
        try {
            gBlacklist = Blacklist.findOne({
                $and: [
                    { userID: user.id },
                    { scope: 'global' },
                    { status: true }
                ]
            });
        } catch (err) {
            this.client.logger.error(err.stack);
        }

        const guildBlacklist = gBlacklist || {};
        return guildBlacklist;
    }
};