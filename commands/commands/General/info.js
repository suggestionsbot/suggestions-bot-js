const { RichEmbed } = require('discord.js');
const { oneLineTrim } = require('common-tags');
const Command = require('../../Command');
const { version, description } = require('../../../package.json');

module.exports = class InfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'info',
            category: 'General',
            description: 'View bot information.',
            aliases: ['botinfo'],
            botPermissions: ['ADD_REACTIONS', 'EMBED_LINKS']
        });
    }

    async run(message, args) {
        
        let { embedColor, discord, owner, website } = this.client.config;

        const embed = new RichEmbed()
            .setTitle(this.client.user.username)
            .setDescription(description)
            .setColor(embedColor)
            .setThumbnail(this.client.user.avatarURL)
            .addField('Bot Author', `<@${owner}>`)
            .addField('Support Discord', discord)
            .addField('Website', website)
            .addField('Bot Version', version)
            .setFooter('© 2019 Nerd Cave Development');

        return message.channel.send(embed);
    }
};