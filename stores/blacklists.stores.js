const mongoose = require('mongoose');
const { Blacklist } = require('../models');

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

    // this method adds a new user blacklist to the guild blacklists
    async addUserBlacklist(user) {
        let submitted = user;
        let defaults = { _id: mongoose.Types.ObjectId() };
        let merged = Object.assign(defaults, submitted);

        const newBlacklist = await new Blacklist(merged);
        return newBlacklist.save().then(res => {
            if (submitted.scope === 'global') {
                return this.client.logger.log(`"${res.issuerUsername}" (${res.issuerID}) has issued a global blacklist for the user "${res.userID}".`);
            } else {
                return this.client.logger.log(`"${res.issuerUsername}" (${res.issuerID}) has issued a blacklist for the user "${res.userID}".`);
            }
        });
    }

    // this method lifts a user blacklist in the database
    async removeUserBlacklist(user) {
        let { query, status } = user;
        let guildMemberBlacklist = await Blacklist.findOne({ $and: query }).sort({ case: -1 });
        let { issuerUsername, issuerID, userID, scope } = guildMemberBlacklist;
        let updatedData = status;

        await guildMemberBlacklist.updateOne(updatedData);

        if (scope === 'global') return this.client.logger.log(`"${issuerUsername}" (${issuerID}) has issued a global unblacklist for the user "${userID}".`);
        else return this.client.logger.log(`"${issuerUsername}" (${issuerID}) has issued an unblacklist for the user "${userID}".`);
    }
};