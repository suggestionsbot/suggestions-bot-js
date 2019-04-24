const { RichEmbed } = require('discord.js');
const Command = require('../../Command');

module.exports = class VoteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'vote',
            category: 'General',
            description: 'Vote for the bot on various Discord bot lists.',
            botPermissions: ['EMBED_LINKS'],
            guildOnly: false,
            guarded: true
        });
    }

    async run (message, args) {

        let { embedColor, voteSites, discord} = this.client.config;

        let i = 1;
        let sites = voteSites
            .filter(site => site.voting)
            .map(site => {
                return `**${i++})** [**${site.name}**](${site.link})`;
            }).join('\n');

        let voteEmbed = new RichEmbed()
            .setTitle('Vote Information')
            .setDescription(`
                Vote for the ${this.client.user}'s bot on our vote sites list below!

                ${sites}

                Voting helps show your support for the bot and the developers. It's not
                required, but spreading the word and upping our presence is always much appreciated!

                For more information regarding voting, feel free to join our Discord: ${discord}
            `)
            .setColor(embedColor);

        return message.channel.send(voteEmbed);
    }
};