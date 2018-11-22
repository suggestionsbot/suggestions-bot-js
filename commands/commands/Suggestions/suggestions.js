const { RichEmbed } = require('discord.js');
const Command = require('../../Command');

module.exports = class SuggestionsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'suggestions',
            category: 'Suggestions',
            description: 'View suggestions data in this guild.',
            botPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS']
        });
    }

    async run(message, args) {

        let { embedColor } = this.client.config;

        message.delete().catch(O_o => {});

        let gSuggestions = await this.client.getGuildSuggestions(message.guild).catch(err => {
            this.client.logger.error(err);
            return message.channel.send(`Error querying the database for this guild's suggestions: **${err.message}**.`);
        });

        if (gSuggestions.length === 0) return message.channel.send('No suggestions data exists in this guild!').then(msg => msg.delete(3000)).catch(err => this.client.logger.error(err));

        let approved = 0;
        let rejected = 0;
        for (let i in gSuggestions) {
            if (gSuggestions[i].status === 'approved') approved++;
            if (gSuggestions[i].status === 'rejected') rejected++;
        }

        const srvIcon = `https://cdn.discordapp.com/icons/${message.guild.id}/${message.guild.icon}.png?size=2048`;

        const embed = new RichEmbed()
            .setAuthor(message.guild.name, message.guild.iconURL)
            .setDescription(`
            **Suggestions Data**

            **Total:** ${gSuggestions.length}

            **Approved:** ${approved}

            **Rejected:** ${rejected}
            `)
            .setColor(embedColor)
            .setThumbnail(srvIcon)
            .setFooter(`Guild ID: ${message.guild.id}`)
            .setTimestamp();

        return message.channel.send(embed);
    }
};