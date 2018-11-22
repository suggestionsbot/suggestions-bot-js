const { RichEmbed } = require('discord.js');
const Command = require('../../Command');
const { version } = require('../../../package.json');

module.exports = class ChangelogCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'changelog',
            category: 'General',
            description: 'View the recent changelog for the bot',
            aliases: ['changes', 'updates', 'changelogs'],
            botPermissions: ['EMBED_LINKS']
        });
    }

    async run(message, args) {

        const { embedColor, discord } = this.client.config;
        
        let g = this.client.guilds.get('480231440932667393') || this.client.guilds.get('345753533141876737');
        let c = g.channels.find(c => c.name === 'updates');

        let fetchedMessages = await c.fetchMessages({ limit: 100 }).catch(err => {
            this.client.logger.error(err);
            return message.channel.send(`There was an error fetching messages from the \`#${c.name}\` channel: **${err.message}**.`);
        });

        fetchedMessages.forEach(async msg => {
            let embed = msg.embeds[0];
            if (!embed) return;

            let update = embed.description;
            let date = embed.fields[0].value;

            let prefix = '**+**';
            let ver = '1.6.4';
            if (!update.includes(ver)) return;
            let rawUpdate = update.toString().split('\n');
            let updates = rawUpdate.filter(u => u.startsWith(prefix));

            let changelogEmbed = new RichEmbed()
                .setTitle(`${this.client.user.username}'s Changelog 🗄`)
                .setThumbnail(this.client.user.avatarURL)
                .setDescription(updates.join('\n'))
                .addField('Date', date)
                .setColor(embedColor);

            if (message.guild.id === '480231440932667393') changelogEmbed.addField('More Information', `Please check our ${c.toString()} channel at ${discord} for previous updates!`);
            else changelogEmbed.addField('More Information', `Please check our \`#${c.name}\` channel at ${discord} for previous updates!`);

            return message.channel.send(changelogEmbed);
        });
    }
};