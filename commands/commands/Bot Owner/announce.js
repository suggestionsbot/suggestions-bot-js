const { RichEmbed } = require('discord.js');
const moment = require('moment');
const Command = require('../../Command');
require('moment-duration-format');
require('moment-timezone');

module.exports = class AnnounceCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'announce',
            category: 'Bot Owner',
            description: 'Announce important updates to guild owners via DM.',
            usage: 'announce <message>',
            botPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES', 'ADD_REACTIONS'],
            ownerOnly: true
        });
    }

    async run(message, args) {

        const { embedColor, discord, docs } = this.client.config;

        if (args[0] === 'help') {
            let options = [
                { name: '{{owner}}', description: 'Parameter for the guild owner.' }
            ];

            let help = options.map(o => `${o.name}: ${o.description}`).join('\n');

            return message.channel.send(help, { code: 'asciidoc' })
                .then(m => m.delete(5000))
                .catch(err => this.client.logger.error(err.stack));
        }

        let announcement = await this.client.awaitReply(message, 'What would you like to say?');
        if (announcement === 'cancel') return message.channel.send('Cancelled input.').then(msg => msg.delete(3000)).catch(err => this.client.logger.error(err.stack));

        const announceEmbed = new RichEmbed()
            .setAuthor(this.client.user.username, this.client.user.avatarURL)
            .setDescription(announcement)
            .setColor(embedColor)
            .addField('Support Discord', discord)
            .addField('Documentation', docs)
            .setTimestamp();

        let confirmation = await this.client.awaitReply(message, `Here is a preview of the announcement. If this is what you want, just type \`confirm\` to send.`, { embed: announceEmbed });
        if (confirmation === 'confirm') {
            await message.channel.bulkDelete(5).catch(err => {
                this.client.logger.error(err.stack);
                return message.channel.send(`An error occurred: **${err.message}**`);
            });
            
            let dmErrorCount = 0;
            let dmSuccessCount = 0;
            let ignoredGuilds = [
                '264445053596991498', 
                '110373943822540800',
                '450100127256936458',
                '454933217666007052',
                '374071874222686211',
            ];

            try {
                await this.client.guilds.forEach(async g => {
                    let owner = g.owner;
                    if (ignoredGuilds.includes(g.id)) return;

                    let updatedAnnouncement = announcement.replace('{{owner}}', owner.user.toString());
                    announceEmbed.setDescription(updatedAnnouncement);
                    owner.send(announceEmbed);
                    dmSuccessCount++;
                    await this.client.wait(2500);
                });
            } catch (err) {
                dmErrorCount++;
            }

            return message.channel.send(`Successfully messaged **${dmSuccessCount}** user(s).${dmErrorCount > 1 ? ` However, I was not able to DM **${dmErrorCount}** user(s)!` : ''}`);
        } else {
            message.channel.send('Could not confirm your announcement. Cancelling...').then(msg => msg.delete(3000)).catch(err => this.client.logger.error(err.stack));
            return message.channel.bulkDelete(6).catch(err => {
                this.client.logger.error(err.stack);
                return message.channel.send(`An error occurred: **${err.message}**`);
            });
        }
    }
};