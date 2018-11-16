const { RichEmbed } = require('discord.js');
const moment = require('moment');
const Command = require('../../Command');
require('moment-duration-format');
require('moment-timezone');

module.exports = class MySuggestions extends Command {
    constructor(client) {
        super(client, {
            name: 'mysuggestions',
            category: 'Suggestions',
            description: 'View your own suggestions data in this guild.',
            botPermissions: ['MANAGE_MESSAGES']
        });
    }

    async run(message, args) {

        const { embedColor } = this.client.config;

        message.delete().catch(O_o => {});

        let gSuggestions = await this.client.getGuildMemberSuggestions(message.guild, message.author).catch(err => {
            this.client.logger.error(err);
            return message.channel.send(`Error querying the database for your suggestions: **${err.message}**.`);
        });

        if (gSuggestions.length === 0) return message.channel.send('No suggestions data exists for you in this guild!').then(msg => msg.delete(3000)).catch(err => this.client.logger.error(err));

        let approved = 0;
        let rejected = 0;
        for (let i in gSuggestions) {
            if (gSuggestions[i].status === 'approved') approved++;
            if (gSuggestions[i].status === 'rejected') rejected++;
        }

        const lastDate = moment(new Date(gSuggestions[0].time)).utc().format('MM/DD/YY');
        const lastsID = gSuggestions[0].sID;

        const embed = new RichEmbed()
            .setAuthor(message.author.tag + ' | ' + message.guild.name, message.author.avatarURL)
            .setDescription(`
            **Suggestions Data**

            **Total:** ${gSuggestions.length}

            **Approved:** ${approved}

            **Rejected:** ${rejected}

            **Last Suggestion:** ${lastsID} (${lastDate})
            `)
            .setColor(embedColor)
            .setThumbnail(message.author.avatarURL)
            .setFooter(`User ID: ${message.author.id}`)
            .setTimestamp();

        return message.channel.send(embed);
    }
};