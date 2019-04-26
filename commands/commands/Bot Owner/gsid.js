const { RichEmbed } = require('discord.js');
const moment = require('moment');
const Command = require('../../Command');
const { noBotPerms } = require('../../../utils/errors');
require('moment-duration-format');
require('moment-timezone');

module.exports = class GsIDCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'gsid',
            category: 'Suggestions',
            description: 'View the information of a specific guild suggestion by their sID (globally for bot owners).',
            usage: 'gsid <sID>',
            ownerOnly: true,
            guildOnly: false,
            botPermissions: ['MANAGE_MESSAGES']
        });
    }

    async run(message, args, settings) {

        const { embedColor } = this.client.config;

        let perms = message.guild.me.permissions;
        if (!perms.has('MANAGE_MESSAGES')) return noBotPerms(message, 'MANAGE_MESSAGES');

        message.delete().catch(O_o => {});

        if (!args[0]) return this.client.errors.noUsage(message.channel, this, settings);

        let sID;
        try {
            sID = await this.client.suggestions.getGlobalSuggestion(args[0]);
        } catch (err) {
            this.client.logger.error(err.stack);
            return message.channel.send(`Error querying the database for this suggestion: **${err.message}**.`);
        }

        if (!sID._id) return message.channel.send(`Could not find the suggestion with the sID **${args[0]}** in the database.`).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err.stack));
        
        let { 
            time,
            newTime,
            userID,
            suggestion,
            staffMemberID,
            results,
            newResults,
            status,
            statusUpdated,
            newStatusUpdated,
            guildID
        } = sID;

        let submittedOn,
            updatedOn;

        if (time) submittedOn = moment(new Date(time)).utc().format('MM/DD/YY @ h:mm A (z)');
        if (newTime) submittedOn = moment(new Date(newTime)).utc().format('MM/DD/YY @ h:mm A (z)');

        if (statusUpdated) updatedOn = moment.utc(new Date(statusUpdated)).format('MM/DD/YY @ h:mm A (z)');
        if (newStatusUpdated) updatedOn = moment.utc(new Date(newStatusUpdated)).format('MM/DD/YY @ h:mm A (z)');

        const guild = this.client.guilds.get(guildID);
        const sUser = this.client.users.get(userID);
        const sStaff = this.client.users.get(staffMemberID);

        let embed = new RichEmbed()
            .setAuthor(guild.name, guild.iconURL)
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
                ${sUser}
        
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
                ${sUser}

                **Suggestion**
                ${suggestion}

                **Submitted**
                ${submittedOn}

                **Approved**
                ${updatedOn}

                **Approved By**
                ${sStaff}

                **Results**
                ${nResults.join('\n') || results}
            
                `);
                embed.setColor('#00e640');
                message.channel.send(embed);
                break;
            case 'rejected':
                embed.setDescription(`
                **Submitter**
                ${sUser}

                **Suggestion**
                ${suggestion}

                **Submitted**
                ${submittedOn}

                **Rejected**
                ${updatedOn}

                **Rejected By**
                ${sStaff}

                **Results**
                ${nResults.join('\n') || results}
            
                `);
                embed.setColor('#cf000f');
                message.channel.send(embed);
                break;
            default:
                this.client.errors.noUsage(message.channel, this, settings);
                break;
        }
        return;
    }
};