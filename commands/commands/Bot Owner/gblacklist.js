const { RichEmbed } = require('discord.js');
const moment = require('moment');
const Command = require('../../Command');

module.exports = class GBlacklistCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'gblacklist',
            category: 'Bot Owner',
            description: 'Add or remove a user from the bot blacklist (globally).',
            usage: 'gblacklist <add/remove> <user ID> <reason>',
            ownerOnly: true,
            guildOnly: false,
            botPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS']
        });
        this.blStatus = {
            true: 'True',
            false: 'False'
        };
    }

    async run(message, args, settings) {

        const { name, usage } = this.help;
        const { embedColor } = this.client.config;
        await message.delete().catch(O_o=>{});

        let gBlacklist = await this.client.blacklists.getGlobalBlacklist().catch(err => {
            this.client.logger.error(err.stack);
            return message.channel.send(`Error querying the database for the bot's blacklist information: **${err.message}**.`);
        });

        if (!message.guild) settings.prefix = this.client.config.prefix;

        let caseNum = gBlacklist.length + 1;

        let blEmbed = new RichEmbed().setTimestamp();

        if (!args[0]) {

            let active =  0;
            for (let i = 0; i < gBlacklist.length; i++) {
                try {
                    if (gBlacklist[i].status === false) continue;
                    const issuer = this.client.users.get(gBlacklist[i].isserID);
                    let caseNum = gBlacklist[i].case;
                    let caseUser = `${gBlacklist[i].userID}`;
                    let caseReason = gBlacklist[i].reason;
                    let caseIssuer = `${issuer.tag} (${issuer.id})`;
                    let caseStatus = this.blStatus[gBlacklist[i].status];
                    await blEmbed.addField(`Case #${caseNum}`, `**User:** ${caseUser}\n **Reason:** ${caseReason}\n **Issuer:** ${caseIssuer}\n **Status:** ${caseStatus}`);
                    active++;
                } catch (err) {
                    break;
                }
            }
    
            await blEmbed.setTitle(`${this.client.user.username} | Blacklisted User`);
            await blEmbed.setDescription(`These users are currently blacklisted from using any of the bot commands globally. Use \`${settings.prefix + name} help\` for command information.`);
            await blEmbed.setColor(embedColor);
    
            if (gBlacklist.length === 0) {
                return message.channel.send(`There are no blacklisted users! Use \`${settings.prefix + name} <help>\` for more information.`)
                    .then(msg => msg.delete(5000))
                    .catch(err => this.client.logger.error(err.stack));
            }
            if (active === 0) {
                return message.channel.send(`There are currently no active blacklisted users. Use \`${settings.prefix + name} <help>\` for more information.`)
                    .then(msg => msg.delete(5000))
                    .catch(err => this.client.logger.error(err.stack));
            }
    
            return message.channel.send(blEmbed);
        }

        if (args[0] === 'help') {
            return message.channel.send(`Usage: ${message.guild ? `\`${settings.prefix + usage}\`` : `\`${this.client.config.prefix + usage}\``}`)
                .then(msg => msg.delete(5000))
                .catch(err => this.client.logger.error(err.stack));
        }

        let blacklisted = args[1];
        let reason = args.slice(2).join(' ');
        const userIDCheck = /^\d+$/;
        if (!userIDCheck.test(blacklisted)) return message.channel.send('You must supply a user ID.').then(msg => msg.delete(3000)).catch(err => this.client.logger.error(err.stack));
        const blUser = blacklisted.match(userIDCheck)[0];

        switch(args[0]) {
            case 'add': {
                if (!reason) return message.channel.send('Please provide a reason!').then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err.stack));

                const newBlacklist = {
                    userID: blUser,
                    reason: reason,
                    issuerID: message.author.id,
                    time: moment(Date.now()),
                    status: true,
                    case: caseNum,
                    scope: 'global'
                };

                blEmbed.setTitle(`${this.client.user.username} | Blacklisted User Added`);
                blEmbed.setColor('#00e640');
                blEmbed.addField('User ID', blUser, true);
                blEmbed.addField('Reason', reason, true);
                blEmbed.addField('Issuer', `${message.author.tag} (${message.author.id})`);

                try {
                    await this.client.blacklists.addUserBlacklist(newBlacklist);
                    message.channel.send(blEmbed).then(msg => msg.delete(5000));
                } catch (err) {
                    this.client.logger.error(err.stack);
                    return message.channel.send(`There was an error adding this user to the blacklist: **${err.message}**.`);
                }
                break;
            }
            case 'remove': {

                const removeBlacklist = {
                    query: [
                        { userID: blUser },
                        { status: true }
                    ],
                    status: { status: false }
                };

                blEmbed.setTitle(`${this.client.user.username} | Blacklisted User Removed`);
                blEmbed.setColor('#d64541');
                blEmbed.addField('User ID', `${blUser}`, true);
                blEmbed.addField('Issuer', `${message.member.user.tag} (${message.author.id})`);

                try {
                    await this.client.blacklists.removeUserBlacklist(removeBlacklist);
                    message.channel.send(blEmbed).then(msg => msg.delete(5000));
                } catch (err) {
                    this.client.logger.error(err.stack);
                    return message.channel.send(`There was an error removing this user from the blacklist: **${err.message}**.`);
                }
                break;
            }
            default:
                this.client.errors.noUsage(message.channel, this, settings);
                break;
        }
        return;
    }
};