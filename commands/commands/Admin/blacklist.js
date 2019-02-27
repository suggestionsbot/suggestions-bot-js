const { RichEmbed } = require('discord.js');
const moment = require('moment');
const Command = require('../../Command');

const blStatus = {
    true: 'True',
    false: 'False'
};

module.exports = class BlacklistCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'blacklist',
            category: 'Admin',
            description: 'Add or remove a user from the bot blacklist (guild-only).',
            usage: 'blacklist <add/remove> <user ID> <reason>',
            adminOnly: true,
            botPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS']
        });
    }

    async run(message, args, settings) {

        const { name, usage } = this.help;
        const { embedColor } = this.client.config;
    
        await message.delete().catch(O_o=>{});

        let gBlacklist = await this.client.blacklists.getGuildBlacklist(message.guild);

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
            await blEmbed.setDescription(`These users are currently blacklisted from using any of the bot commands in this guild. Use \`${settings.prefix + name} help\` for command information.`);
            await blEmbed.setColor(embedColor);
    
            if (gBlacklist.length === 0) return message.channel.send(`There are no blacklisted users! Use \`${settings.prefix + name} <help>\` for more information.`).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err.stack));
            if (active === 0) return message.channel.send(`There are currently no active blacklisted users. Use \`${settings.prefix + name} <help>\` for more information.`).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err.stack));
    
            return message.channel.send(blEmbed);
        }

        if (args[0] === 'help') return message.channel.send(`Usage: \`${settings.prefix + usage}\``).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err.stack));

        let blacklisted = args[1];
        let reason = args.slice(2).join(' ');
        const userIDCheck = /^\d+$/;
        if (!userIDCheck.test(blacklisted)) return message.channel.send('You must supply a user ID.').then(msg => msg.delete(3000)).catch(err => this.client.logger.error(err.stack));
        const blUser = blacklisted.match(userIDCheck)[0];

        const blMember = message.guild.members.get(blUser);

        switch(args[0]) {
            case 'add': {
                if (!reason) return message.channel.send('Please provide a reason!').then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err.stack));

                const newBlacklist = {
                    guildID: message.guild.id,
                    guildName: message.guild.name,
                    userID: blUser,
                    reason: reason,
                    issuerID: message.author.id,
                    issuerUsername: message.member.user.tag,
                    time: moment(Date.now()),
                    status: true,
                    case: caseNum
                };

                blEmbed.setTitle(`${this.client.user.username} | Blacklisted User Added`);
                blEmbed.setColor('#00e640');
                blEmbed.addField('User ID', blUser, true);
                blEmbed.addField('Reason', reason, true);
                blEmbed.addField('Issuer', `${message.member.user.tag} (${message.author.id})`);

                
                const dmBlacklistAdd = new RichEmbed()
                    .setDescription(`
                    Hello${blMember || ''},

                    You have been blacklisted by ${message.author} from using any of the ${this.client.user}'s commands in the guild **${message.guild.name}**.
                    
                    This blackist does not expire and can only be removed at the discretion of a server administrator. You may find the reason below.

                    **Reason:** ${reason}
                    `)
                    .setColor(`#00e640`)
                    .setTimestamp();

                try {
                    await this.client.blacklists.addUserBlacklist(newBlacklist);
                    blMember.send(dmBlacklistAdd);
                    message.channel.send(blEmbed).then(msg => msg.delete(5000));
                } catch (err) {
                    this.client.logger.error(err.message);
                    return message.channel.send(`Could not DM **${blUser}** about their blacklist because they either have DMs disabled or aren't a member of this server.`);
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

                const dmBlacklistRemove = new RichEmbed()
                    .setDescription(`
                    Hello${blMember || ''},

                    You have been unblacklisted by ${message.author}. This means you are now able to use the ${this.client.user}'s commands in the guild **${message.guild.name}**.

                    **Reason:** ${reason ? reason : 'None provided'}
                    `)
                    .setColor(`#d64541`)
                    .setTimestamp();

                try {
                    await this.client.blacklists.removeUserBlacklist(removeBlacklist);
                    blMember.send(dmBlacklistRemove);
                    message.channel.send(blEmbed).then(msg => msg.delete(5000));
                } catch (err) {
                    this.client.logger.error(err.message);
                    return message.channel.send(`There was an error removing this user from the blacklist: **${err.message}**.`);
                }
                break;
            }
            default:
                message.channel.send(`Usage: \`${settings.prefix + usage}\``).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err.stack));
                break;
        }
        return;
    }
};