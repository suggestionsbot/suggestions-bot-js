const { RichEmbed } = require('discord.js');
const { noBotPerms } = require('../../utils/errors');
const Command = require('../../base/Command');

module.exports = class Changelog extends Command {
    constructor(client) {
        super(client, {
            name: 'changelog',
            category: 'General',
            description: 'View the recent changelog for the bot',
            aliases: ['changes', 'updates', 'changelogs']
        });
    }

    async run(message, args) {

        const { embedColor, discord } = this.client.config;

        let perms = message.guild.me.permissions;
        if (!perms.has('EMBED_LINKS')) return noBotPerms(message, 'EMBED_LINKS');
        
        let g = this.client.guilds.get('480231440932667393') || this.client.guilds.get('345753533141876737');
        let c = g.channels.find(c => c.name === 'updates');
        let lastUpdateID = c.lastMessageID;
        let lastUpdate = await c.fetchMessage(lastUpdateID);
        let update = lastUpdate.embeds[0].description;
        let date = lastUpdate.embeds[0].fields[0].value;

        let prefix = '**>**';
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
    }
};