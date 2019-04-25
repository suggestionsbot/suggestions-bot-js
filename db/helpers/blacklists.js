const mongoose = require('mongoose');
const { Blacklist } = require('../models');

module.exports = class BlacklistsHelpers {
    constructor(client) {
        this.client = client;
    }

    /**
     * Get any blacklists in the database from a guild.
     * 
     * @param {Object} guild - The guild object.
     */
    async getGuildBlacklist(guild) {
        const data = await Blacklist
            .find({ guildID: guild.id });

        return data;
    }

    /**
     * Get all global blacklists from the database.
     */
    async getGlobalBlacklist() {
        const data = await Blacklist.find({ scope: 'global' });

        return data;
    }

    /**
     * Get a guild-specific blacklisted user if present in the database.
     * 
     * @param {Object} guild - The guild object.
     * @param {Object} user - The user object.
     */
    async checkGuildBlacklist(guild, user) {
        const data = await Blacklist.findOne({
            $and: [
                { guildID: guild.id },
                { userID: user.id },
                { status: true }
            ]
        });

        return data;
    }

    /**
     * Get a globally blacklist user if present in the database.
     * 
     * @param {Object} user - The user object.
     */
    async checkGlobalBlacklist(user) {
        const data = await Blacklist.findOne({
            $and: [
                { userID: user.id },
                { scope: 'global' },
                { status: true }
            ]
        });

        return data;
    }

    /**
     * Add a new user blacklist in the database.
     * 
     * @param {Object} user - The user object.
     */
    async addUserBlacklist(user) {
        const defaults = { _id: mongoose.Types.ObjectId() };
        const merged = Object.assign(defaults, user);

        const newBlacklist = await new Blacklist(merged);
        const data = await newBlacklist.save();
        
        if (user.scope === 'global') {
            this.client.logger.log(`"${data.issuerUsername}" (${data.issuerID}) has issued a global blacklist for the user "${data.userID}".`);
        } else {
            this.client.logger.log(`"${data.issuerUsername}" (${data.issuerID}) has issued a blacklist for the user "${data.userID}".`);
        }
        return data;
    }
    /**
     * Update a blacklisted user's status to false in the database.
     * 
     * @param {Object} user - The user object.
     */
    async removeUserBlacklist(user) {
        const { query, status } = user;
        const guildMemberBlacklist = await Blacklist
            .findOne({ $and: query })
            .sort({ case: -1 });
        const { issuerUsername, issuerID, userID, scope } = guildMemberBlacklist;
        const updatedData = status;

        const data = await guildMemberBlacklist.updateOne(updatedData);

        if (scope === 'global') {
            this.client.logger.log(`"${issuerUsername}" (${issuerID}) has issued a global unblacklist for the user "${userID}".`);
        } else {
            this.client.logger.log(`"${issuerUsername}" (${issuerID}) has issued an unblacklist for the user "${userID}".`);
        }
        
        return data;
    }
};