const { RichEmbed } = require('discord.js');
const moment = require('moment');
const mongoose = require('mongoose');
const Command = require('../../base/Command');
const Blacklist = require('../../models/blacklist');
const { noBotPerms } = require('../../utils/errors');

const blStatus = {
    true: 'True',
    false: 'False'
};

module.exports = class BlacklistCmd extends Command {
    constructor(client) {
        super(client, {
            name: 'gblacklist',
            category: 'Bot Owner',
            description: 'Add or remove a user from the bot blacklist (globally).',
            usage: 'blacklist <add/remove> <user ID> <reason>',
            ownerOnly: true
        });
    }

    async run(message, args) {

        const { name, usage } = this.help;
        const { embedColor } = this.client.config;

        let perms = message.guild.me.permissions;
        if (!perms.has('MANAGE_MESSAGES')) return noBotPerms(message, 'MANAGE_MESSAGES');
        if (!perms.has('EMBED_LINKS')) return noBotPerms(message, 'EMBED_LINKS');
    
        await message.delete().catch(O_o=>{});

        let gSettings = await this.client.getSettings(message.guild).catch(err => {
            this.client.logger.error(err);
            return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
        });

        let gBlacklist = await this.client.getGlobalBlacklist().catch(err => {
            this.client.logger.error(err);
            return message.channel.send(`Error querying the database for the bot's blacklist information: **${err.message}**.`);
        });

        let caseNum = gBlacklist.length + 1;

        let blEmbed = new RichEmbed().setTimestamp();

        if (!args[0]) {

            let active =  0;
            for (let i = 0; i < gBlacklist.length; i++) {
                try {
                    if (gBlacklist[i].status === false) continue;
                    let caseNum = gBlacklist[i].case;
                    let caseUser = `${gBlacklist[i].userID}`;
                    let caseReason = gBlacklist[i].reason;
                    let caseIssuer = `${gBlacklist[i].issuerUsername} (${gBlacklist[i].issuerID})`;
                    let caseStatus = blStatus[gBlacklist[i].status];
                    await blEmbed.addField(`Case #${caseNum}`, `**User:** ${caseUser}\n **Reason:** ${caseReason}\n **Issuer:** ${caseIssuer}\n **Status:** ${caseStatus}`);
                    active++;
                } catch (err) {
                    break;
                }
            }
    
            await blEmbed.setTitle(`${this.client.user.username} | Blacklisted User`);
            await blEmbed.setDescription(`These users are currently blacklisted from using any of the bot commands in this guild. Use \`${gSettings.prefix + usage} help\` for command information.`);
            await blEmbed.setColor(embedColor);
    
            if (gBlacklist.length === 0) return message.channel.send(`There are no blacklisted users! Use \`${gSettings.prefix + name} <help>\` for more information.`).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err));
            if (active === 0) return message.channel.send(`There are currently no active blacklisted users. Use \`${gSettings.prefix + name} <help>\` for more information.`).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err));
    
            return message.channel.send(blEmbed);
        }

        if (args[0] === 'help') return message.channel.send(`Usage: \`${gSettings.prefix + usage}\``).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err));

        let blacklisted = args[1];
        let reason = args.slice(2).join(' ');
        const userIDCheck = /^\d+$/;
        if (!userIDCheck.test(blacklisted)) return message.channel.send('You must supply a user ID.').then(msg => msg.delete(3000)).catch(err => this.client.logger.error(err));
        const blUser = blacklisted.match(userIDCheck)[0];

        switch(args[0]) {
            case 'add': {
                if (!reason) return message.channel.send('Please provide a reason!').then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err));

                const newBlacklist = await new Blacklist({
                    _id: mongoose.Types.ObjectId(),
                    guildID: message.guild.id,
                    guildName: message.guild.name,
                    userID: blUser,
                    reason: reason,
                    issuerID: message.author.id,
                    issuerUsername: message.member.user.tag,
                    time: moment(Date.now()),
                    status: true,
                    case: caseNum,
                    scope: 'global'
                });

                await newBlacklist.save().then(res => this.client.logger.log('New Blacklist: \n ', res)).catch(err => this.client.logger.error(err));
                await this.client.logger.log(`${message.member.user.tag} ("${message.author.id}") has issued a blacklist to the user ${blUser}. [${moment(message.createdAt)}]`);
                await blEmbed.setTitle(`${this.client.user.username} | Blacklisted User Added`);
                await blEmbed.setColor('#00e640');
                await blEmbed.addField('User ID', `${blUser}`, true);
                await blEmbed.addField('Reason', reason, true);
                await blEmbed.addField('Issuer', `${message.member.user.tag} (${message.author.id})`);

                message.channel.send(blEmbed).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err));
                break;
            }
            case 'remove': {
                Blacklist.findOneAndUpdate({
                    $and: [
                        { userID: blUser },
                        { status: true }
                    ]},
                     { $set: { status: false }
                })
                .sort({
                    case: -1
                })
                .then(async () => {
                    await this.client.logger.log(`${message.member.user.tag} ("${message.author.id}") has issued an unblacklist for the user ${blUser}.`);
                    await blEmbed.setTitle(`${this.client.user.username} | Blacklisted User Removed`);
                    await blEmbed.setColor('#d64541');
                    await blEmbed.addField('User ID', `${blUser}`, true);
                    await blEmbed.addField('Issuer', `${message.member.user.tag} (${message.author.id})`);
    
                    await message.channel.send(blEmbed).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err));
                })
                .catch(err => this.client.logger.error(err));
                break;
            }
            default:
                message.channel.send(`Usage: \`${gSettings.prefix + usage}\``).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err));
                break;
        }
        return;
    }
};