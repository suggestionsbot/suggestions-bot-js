const { RichEmbed } = require('discord.js');
const voteEmojis = require('../../../utils/voteEmojis');
const Command = require('../../Command');

module.exports = class SetVotesCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setvotes',
            category: 'Admin',
            description: 'Set custom emojis to use when voting.',
            usage: 'setvotes <id>',
            adminOnly: true,
            botPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS']
        });
    }

    async run(message, args) {

        const { embedColor, discord } = this.client.config;

        await message.delete().catch(O_o => {});

        let gSettings = await this.client.settings.getSettings(message.guild).catch(err => {
            this.client.logger.error(err.stack);
            return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
        });

        const usage = this.help.usage;

        let embed = new RichEmbed()
            .setAuthor(message.guild.name, message.guild.iconURL)
            .setColor(embedColor)
            .setFooter(`Guild ID: ${message.guild.id}`)
            .setTimestamp();

        let setID = parseInt(args[0]);
        
        if (args[0]) {

            if (args[0] && (setID > voteEmojis.length - 1)) {
                return message.channel.send(`**${setID}** is not a valid emoji set id!`)
                    .then(msg => msg.delete(3000).catch(err => this.client.logger.error(err.stack)));
            }

            for (let i = 0; i < voteEmojis.length; i++) {

                const mappedEmojis = Array.from(Object.values(voteEmojis[i].emojis));

                if (args[0] && (setID === voteEmojis[i].id)) {

                    this.client.settings.writeSettings(message.guild, {
                        voteEmojis: voteEmojis[i].name
                    }).catch(err => {
                        this.client.logger.error(err.stack);
                        return message.channel.send(`Error updating the default emoji set: **${err.message}**.`);
                    });

                    this.client.logger.log(`The default vote emojis in the guild ${message.guild.name} (${message.guild.id}) has been changed to ${mappedEmojis.join(' ')}.`);
                    return message.channel.send(`The default vote emojis have been changed to ${mappedEmojis.join(' ')}.`).then(msg => msg.delete(5000).catch(err => this.client.logger.error(err.stack)));
                } 
            }
        }

        let view = '';
        let emojiSets = [];
        for (let i = 0; i < voteEmojis.length; i++) {

            const emojiSet = Array.from(Object.values(voteEmojis[i].emojis));

            for (const val of Object.values(voteEmojis[i].emojis)) {
                view = `\`${voteEmojis[i].id}\`: ${emojiSet.join(' ')}`;

                if (gSettings.voteEmojis === voteEmojis[i].name) {
                    view = `\`${voteEmojis[i].id}\`: ${emojiSet.join(' ')} ***(Currently Using)***`;
                }

                emojiSets.push(view);
                break;
            }
        }

        if (!gSettings.voteEmojis) {
            let str = emojiSets[0].concat(' ', '***(Currently Using)***');
            emojiSets[0] = str;
        }

        if (!args[0]) {
            embed.setDescription(`
            **Voting Emojis**
            Choose from ${voteEmojis.length} different emoji sets to be used for voting in your guild.

            ${emojiSets.join('\n\n')}

            You can do \`${gSettings.prefix + usage}\` to set the desired emojis.
            Submit new emoji set suggestions any time by joining our Discord server: ${discord}
            `);

            return message.channel.send(embed);
        }

        return;
    }
};