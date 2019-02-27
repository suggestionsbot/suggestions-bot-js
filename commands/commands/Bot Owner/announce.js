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

        const { embedColor, discord, website } = this.client.config;

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
            .addField('Website', website)
            .setTimestamp();

        let dmErrorCount = 0;
        let dmSuccessCount = 0;
        let ignoredGuilds = [
            '264445053596991498', 
            '110373943822540800',
            '450100127256936458',
            '454933217666007052',
            '374071874222686211',
        ];

        let confirmation = await this.client.awaitReply(message, `Here is a preview of the announcement. If this is what you want, just type \`confirm\` to send.`, { embed: announceEmbed });
        if (confirmation === 'confirm') {
            await message.channel.bulkDelete(5).catch(err => {
                this.client.logger.error(err.stack);
                return message.channel.send(`An error occurred: **${err.message}**`);
            });

            const guilds = this.client.guilds.map(g => {
                return {
                    id: g.id,
                    owner: g.owner.user
                };
            });
            
            delayedIteration(0, guilds);
            message.channel.send(`Announcement is now in the progress of being sent to the owners of **${guilds.length}** guilds. Hang tight!`);
        } else {
            message.channel.send('Could not confirm your announcement. Cancelling...').then(msg => msg.delete(3000)).catch(err => this.client.logger.error(err.stack));
            message.channel.bulkDelete(6).catch(err => {
                this.client.logger.error(err.stack);
                return message.channel.send(`An error occurred: **${err.message}**`);
            });
        }

        function delayedIteration(index, array) {
            if (index >= array.length) {
                return message.channel.send(`Successfully messaged **${dmSuccessCount}** user(s).${dmErrorCount > 1 ? ` However, I was not able to DM **${dmErrorCount}** user(s)!` : ''}`);
            }

            try {
                let g = array[index];
                let owner = g.owner;
                if (ignoredGuilds.includes(g.id)) return;

                let updatedAnnouncement = announcement.replace('{{owner}}', owner.toString());
                announceEmbed.setDescription(updatedAnnouncement);
                owner.send(announceEmbed);
                dmSuccessCount++;
            } catch (err) {
                dmErrorCount++;
            }

            index += 1;
            setTimeout(delayedIteration.bind({}, index, array), 1500);
        }
        return;
    }
};