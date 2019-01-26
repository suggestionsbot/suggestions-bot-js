const { RichEmbed } = require('discord.js');
const moment = require('moment');
const Command = require('../../Command');
const { noSuggestionsLogs } = require('../../../utils/errors');
require('moment-duration-format');
require('moment-timezone');
moment.suppressDeprecationWarnings = true;

module.exports = class RejectCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'reject',
            category: 'Staff',
            description: 'Reject a submitted suggestion via the suggestion ID (sID).',
            usage: 'reject <sID> [response]',
            staffOnly: true,
            botPermissions: ['MANAGE_MESSAGES']
        });
    }

    async run(message, args, settings) {

        const usage = this.help.usage;
        const { rejected } = this.client.config.suggestionColors;

        message.delete().catch(O_o => {});

        if (!settings.staffRoles) return message.channel.send('No staff roles exist! Please create them or contact a server administrator to handle suggestions.').then(msg =>  msg.delete(5000)).catch(err => this.client.logger.error(err.stack));

        const suggestionsChannel = message.guild.channels.find(c => c.name === settings.suggestionsChannel) || (message.guild.channels.find(c => c.toString() === settings.suggestionsChannel)) || (message.guild.channels.get(settings.suggestionsChannel));
        const suggestionsLogs = message.guild.channels.find(c => c.name === settings.suggestionsLogs) || (message.guild.channels.find(c => c.toString() === settings.suggestionsLogs)) || (message.guild.channels.get(settings.suggestionsLogs));
        if (!suggestionsLogs) return noSuggestionsLogs(message.channel);

        let id = args[0];
        let reply = args.slice(1).join(' ');
        if (!id) return message.channel.send(`Usage: \`${settings.prefix + usage}\``).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err.stack));

        let date = moment(Date.now()).format();

        let sID = await this.client.suggestions.getGuildSuggestion(message.guild, id).catch(err => {
            this.client.logger.error(err.stack);
            return message.channel.send(`Error querying the database for this guild's suggestions: **${err.message}**.`);
        });

        if (!sID._id) return message.channel.send(`Could not find the suggestion with the sID **${args[0]}** in the guild database.`).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err.stack));

        if (await this.client.suggestions.isResponseRequired(message.guild) && !reply) {
            return message.channel.send(`A response is required for approving this suggestion. Usage: \`${settings.prefix + usage}\``)
                .then(msg => msg.delete(5000))
                .catch(err => this.client.logger.error(err.stack));
        }
        
        let {
            userID,
            username,
            suggestion,
            status
        } = sID;

        if (status === 'rejected') return message.channel.send(`sID **${id}** has already been rejected. Cannot do this action again.`).then(msg => msg.delete(3000)).catch(err => this.client.logger.error(err.stack));

        const sUser = message.guild.members.get(userID);
        if (!sUser) message.channel.send(`**${username}** is no longer in the guild, but their suggestion will still be rejected.`).then(msg => msg.delete(3000)).catch(err => this.client.logger.error(err.stack));

        let fetchedMessages = await suggestionsChannel.fetchMessages({ limit: 100 }).catch(err => {
            this.client.logger.error(err.stack);
            return message.channel.send(`There was an error fetching messages from the ${suggestionsChannel}: **${err.message}**.`);
        });

        fetchedMessages.forEach(async msg => {
            let embed = msg.embeds[0];
            if (!embed) return;

            const approvedEmbed = new RichEmbed(embed)
                .setTitle('Suggestion Rejected')
                .setColor(rejected);

            const dmEmbed = new RichEmbed()
                .setAuthor(message.guild, message.guild.iconURL)
                .setTitle(message.guild, message.guild.iconURL)
                .setDescription(`Hey, ${sUser}. Unfortunately, your suggestion has been rejected by <@${message.author.id}>!
                            
                Your suggestion ID (sID) for reference was **${id}**.
                `)
                .setColor(rejected)
                .setFooter(`Guild ID: ${message.guild.id} | sID: ${id}`)
                .setTimestamp();

            let reactions = embed.message.reactions;    
            let reactName = reactions.map(e => e._emoji.name);
            let reactCount = reactions.map(e => e.count);
            
            let results = reactName.map((r, c) => {
                return {
                    emoji: r,
                    count: reactCount[c] - 1 || 0
                };
            });

            const nerdSuccess = this.client.guilds.get('345753533141876737').emojis.find(e => e.name === 'nerdSuccess');
            const nerdError = this.client.guilds.get('345753533141876737').emojis.find(e => e.name === 'nerdError');

            results.forEach(result => {
                if (result.emoji === 'nerdSuccess') result.emoji = nerdSuccess.toString();
                if (result.emoji === 'nerdError') result.emoji = nerdError.toString();
            });

            let newResults = Array.from(results);

            let view = newResults.map(r => {
                return `${r.emoji} **: ${r.count}**`;
            }).join('\n');

            const logsEmbed = new RichEmbed()
                .setAuthor(message.guild.name, message.guild.iconURL)
                .setDescription(`
                    **Results:**
                    ${view}
                    
                    **Suggestion:**
                    ${suggestion}
        
                    **Submitter:**
                    <@${userID || sUser.id}>
        
                    **Rejected By:**
                    <@${message.author.id}>
                `)
                .setColor('#cf000f')
                .setFooter(`sID: ${id}`)
                .setTimestamp();

            if (reply) {
                dmEmbed.setDescription(`Hey, ${sUser}. Unfortunately, your suggestion has been rejected by <@${message.author.id}>!
        
                Staff response: **${reply}**
                                    
                Your suggestion ID (sID) for reference was **${id}**.
                `);

                logsEmbed.setDescription(`
                **Results:**
                ${view}

                **Suggestion:**
                ${suggestion}
                    
                **Submitter:**
                <@${userID || sUser.id}>
        
                **Rejected By:**
                <@${message.author.id}>
    
                **Response:**
                ${reply}
                `);
            }

            let footer = embed.footer.text;
            if (footer.includes(id)) {
                let sMessage = await suggestionsChannel.fetchMessage(embed.message.id);

                const sendMsgs = suggestionsLogs.permissionsFor(message.guild.me).has('SEND_MESSAGES', false);
                const reactions = suggestionsLogs.permissionsFor(message.guild.me).has('ADD_REACTIONS', false);
                if (!sendMsgs) return message.channel.send(`I can't send messages in the ${suggestionsLogs} channel! Make sure I have \`Send Messages\`.`);
                if (!reactions) return message.channel.send(`I can't add reactions in the ${suggestionsLogs} channel! Make sure I have \`Add Reactions\`.`);

                message.channel.send(`Suggestion **${id}** has been rejected.`).then(msg => msg.delete(5000));
                sMessage.edit(approvedEmbed).then(msg => msg.delete(5000));
                suggestionsLogs.send(logsEmbed);
                sUser.send(dmEmbed).catch(err => {
                    this.client.logger.error(err.stack);
                    message.channel.send(`An error occurred DMing **${sUser.displayName}** their suggestion information: **${err.message}**.`);
                });

                const rejectSuggestion = {
                    query: [
                        { guildID: message.guild.id },
                        { sID: id }
                    ],
                    status: 'rejected',
                    statusUpdated: date,
                    statusReply: reply || null,
                    staffMemberID: message.author.id,
                    staffMemberUsername: message.author.tag,
                    newResults
                };

                try {
                    await this.client.suggestions.handleGuildSuggestion(rejectSuggestion);
                } catch (err) {
                    this.client.logger.error(err.stack);
                    message.delete(3000).catch(O_o => {});
                    message.channel.send(`Error updating this suggestion in the database: **${err.message}**`);
                }
            }
            return;
        });
        return;
    }
};