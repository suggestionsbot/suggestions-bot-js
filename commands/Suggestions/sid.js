const { RichEmbed } = require('discord.js');
const moment = require('moment');
const Command = require('../../base/Command');
const { noBotPerms } = require('../../utils/errors');
require('moment-duration-format');
require('moment-timezone');

module.exports = class SID extends Command {
    constructor(client) {
        super(client, {
            name: 'sid',
            category: 'Suggestions',
            description: 'View the information of a specific guild suggestion by their sID.',
            usage: 'sid <id>'
        });
    }

    async run(message, args) {

        const { embedColor } = this.client.config;
        const usage = this.help.usage;

        let perms = message.guild.me.permissions;
        if (!perms.has('MANAGE_MESSAGES')) return noBotPerms(message, 'MANAGE_MESSAGES');

        message.delete().catch(O_o => {});

        let gSettings = await this.client.getSettings(message.guild).catch(err => {
            this.client.logger.error(err);
            return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
        });

        if (!args[0]) return message.channel.send(`Usage: \`${gSettings.prefix + usage}\``).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err));

        let sID = await this.client.getGuildSuggestion(message.guild, args[0]).catch(err => {
            this.client.logger.error(err);
            return message.channel.send(`Error querying the database for this suggestion: **${err.message}**.`);
        });

        if (await this.client.isEmpty(sID)) return message.channel.send(`Could not find the suggestion with the sID **${args[0]}** in the guild database.`).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err));
        
        let { 
            time,
            username,
            userID,
            suggestion,
            staffMemberUsername,
            results,
            status,
            statusUpdated
        } = sID;
        
        let submittedOn = moment(new Date(time)).utc().format('MM/DD/YY @ h:mm A (z)');
        let updatedOn = moment(new Date(statusUpdated)).utc().format('MM/DD/YY @ h:mm A (z)');

        let embed = new RichEmbed()
            .setAuthor(message.guild.name, message.guild.iconURL)
            .setTitle(`Info for sID ${args[0]}`)
            .setFooter(`User ID: ${userID} | sID ${args[0]}`);

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
                ${results}
            
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
                ${results}
            
                `);
                embed.setColor('#cf000f');
                message.channel.send(embed);
                break;
            default:
        }
        return;
    }
};