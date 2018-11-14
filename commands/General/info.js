const { RichEmbed } = require('discord.js');
const { oneLineTrim } = require('common-tags');
const Command = require('../../base/Command');
const { noBotPerms } = require('../../utils/errors');
const { version, description } = require('../../package.json');

module.exports = class InfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'info',
            category: 'General',
            description: 'View bot information.',
            aliases: ['botinfo']
        });
    }

    async run(message, args) {

        let perms = message.guild.me.permissions;
        if (!perms.has('ADD_REACTIONS')) return noBotPerms(message, 'ADD_REACTIONS');
        if (!perms.has('EMBED_LINKS')) return noBotPerms(message, 'EMBED_LINKS');
        
        let { embedColor, discord, owner, docs } = this.client.config;

        const embed = new RichEmbed()
            .setTitle(this.client.user.username)
            .setDescription(description)
            .setColor(embedColor)
            .setThumbnail(this.client.user.avatarURL)
            .addField('Bot Author', `<@${owner}>`)
            .addField('Support Discord', discord)
            .addField('Documentation', docs)
            .addField('Bot Version', version)
            .addField('A Special Note', oneLineTrim`RIP to a legend Stan Lee, a man who has changed the face 
            of Marvel Comics and comics in general. Young or old, the characters and worlds he created has 
            impacted so many in a positive way. This is a special thanks to him and his work.`)
            .setFooter('© 2018 Nerd Cave Development');

        return message.channel.send(embed);
    }
};