const { RichEmbed } = require('discord.js');
const moment = require('moment');
const Command = require('../../Command');
require('moment-duration-format');
require('moment-timezone');

module.exports = class SIDCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'sid',
            category: 'Suggestions',
            description: 'View the information of a specific guild suggestion by their sID.',
            usage: 'sid <sID>',
            botPermissions: ['MANAGE_MESSAGES']
        });
    }

    async run(message, args) {

        const { embedColor } = this.client.config;
        const usage = this.help.usage;

        message.delete().catch(O_o => {});

        let gSettings = await this.client.settings.getSettings(message.guild).catch(err => {
            this.client.logger.error(err.stack);
            return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
        });

        if (!args[0]) return message.channel.send(`Usage: \`${gSettings.prefix + usage}\``).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err.stack));

        let sID = await this.client.suggestions.getGuildSuggestion(message.guild, args[0]).catch(err => {
            this.client.logger.error(err.stack);
            return message.channel.send(`Error querying the database for this suggestion: **${err.message}**.`);
        });

        if (await this.client.isEmpty(sID)) return message.channel.send(`Could not find the suggestion with the sID **${args[0]}** in the guild database.`).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err.stack));
        
        let { 
            time,
            username,
            userID,
            suggestion,
            staffMemberUsername,
            results,
            newResults,
            status,
            statusUpdated
        } = sID;
        
        let submittedOn = moment(new Date(time)).utc().format('MM/DD/YY @ h:mm A (z)');
        let updatedOn = moment(new Date(statusUpdated)).utc().format('MM/DD/YY @ h:mm A (z)');

        let embed = new RichEmbed()
            .setAuthor(message.guild.name, message.guild.iconURL)
            .setTitle(`Info for sID ${args[0]}`)
            .setFooter(`User ID: ${userID} | sID ${args[0]}`);

        let nResults = [];
        if (newResults && newResults.length > 1) {
            newResults.forEach(r => {
                nResults.push(`${r.emoji} **${r.count}**`);
            });
        }

        switch (status) {
            case undefined:
                embed.setDescription(`
                **Submitter**
                ${username}
        
                **Suggestion**
                ${suggestion}
    
                **Submitted**
                ${submittedOn}`);
                embed.setColor(embedColor);
                message.channel.send(embed);
                break;
            case 'approved':
                embed.setDescription(`
                **Submitter**
                ${username}

                **Suggestion**
                ${suggestion}

                **Submitted**
                ${submittedOn}

                **Approved**
                ${updatedOn}

                **Approved By**
                ${staffMemberUsername}

                **Results**
                ${nResults.join('\n') || results}
            
                `);
                embed.setColor('#00e640');
                message.channel.send(embed);
                break;
            case 'rejected':
                embed.setDescription(`
                **Submitter**
                ${username}

                **Suggestion**
                ${suggestion}

                **Submitted**
                ${submittedOn}

                **Rejected**
                ${updatedOn}

                **Rejected By**
                ${staffMemberUsername}

                **Results**
                ${nResults.join('\n') || results}
            
                `);
                embed.setColor('#cf000f');
                message.channel.send(embed);
                break;
            default:
        }
        return;
    }
};