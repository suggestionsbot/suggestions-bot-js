const { RichEmbed } = require('discord.js');
const moment = require('moment');
const Command = require('../../Command');
require('moment-duration-format');
require('moment-timezone');

module.exports = class MySuggestionsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'suggestions',
            category: 'Suggestions',
            description: 'View your own suggestions data or another user\'s data in this guild.',
            botPermissions: ['MANAGE_MESSAGES'],
            aliases: ['mysuggestions'],
            usage: 'suggestions <@User>'
        });
    }

    async run(message, args) {

        const { embedColor } = this.client.config;

        await message.delete().catch(O_o => {});

        const sUser = message.mentions.users.first() || message.author;

        let gSuggestions = await this.client.getGuildMemberSuggestions(message.guild, sUser).catch(err => {
            this.client.logger.error(err);
            return message.channel.send(`Error querying the database for your suggestions: **${err.message}**.`);
        });

        if (gSuggestions.length === 0) return message.channel.send(`No suggestions data exists for **${sUser.tag}** in this guild!`).then(msg => msg.delete(3000)).catch(err => this.client.logger.error(err));

        let approved = 0;
        let rejected = 0;
        for (let i in gSuggestions) {
            if (gSuggestions[i].status === 'approved') approved++;
            if (gSuggestions[i].status === 'rejected') rejected++;
        }

        const suggestions = [];
        if (gSuggestions.length >= 1) suggestions.push(`Total: \`${gSuggestions.length}\``);
        if (approved >= 1) suggestions.push(`Approved: \`${approved}\``);
        if (rejected >= 1) suggestions.push(`Rejected: \`${rejected}\``);

        const lastDate = moment(new Date(gSuggestions[0].time)).format('MM/DD/YY');
        const lastsID = gSuggestions[0].sID;
        const lastSuggestion = `${lastsID} (${lastDate})`;

        const createdOn = moment.utc(message.guild.createdAt).format('MM/DD/YY @ h:mm A (z)');
        const joinedOn = moment.utc(message.guild.members.get(sUser.id).joinedAt).format('MM/DD/YY @ h:mm A (z)');

        const embed = new RichEmbed()
            .setAuthor(sUser.tag + ' | ' + message.guild.name, sUser.avatarURL)
            // .setDescription(`
            // **Suggestions Data**

            // **Total:** ${gSuggestions.length}

            // **Approved:** ${approved}

            // **Rejected:** ${rejected}

            // **Last Suggestion:** ${lastsID} (${lastDate})
            // `)
            .setColor(embedColor)
            .setThumbnail(sUser.avatarURL)
            .addField('User', `${sUser} \`[${sUser.id}]\``)
            .addField('Created On', createdOn)
            .addField('Joined', joinedOn)
            .setTimestamp();

        if (gSuggestions.length >= 1) {
            embed.addField('Suggestions', suggestions.join('\n'));
            embed.addField('Last Suggestion (sID)', lastSuggestion);
        }

        return message.channel.send(embed);
    }
};