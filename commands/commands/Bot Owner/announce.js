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

        let announcement = await this.client.awaitReply(message, 'What would you like to say?');
        if (announcement === 'cancel') return message.channel.send('Cancelled input.').then(msg => msg.delete(3000)).catch(err => this.client.logger.error(err));

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
                this.client.logger.error(err);
                return message.channel.send(`An error occurred: **${err.message}**`);
            });
            
            let dmErrorCount = 0;
            let dmSuccessCount = 0;
            let ignoredGuilds = [
                '264445053596991498',
                '110373943822540800',
                '450100127256936458',
                '454933217666007052',
                '330777295952543744',
                '374071874222686211',
            ];

            await this.client.guilds.forEach(g => {
                
                let owner = g.owner;
                if (ignoredGuilds.includes(g.id)) return;
    
                owner.send(announceEmbed).catch(err => {
                    dmErrorCount++;
                    this.client.logger.error(err);
                    return message.channel.send(`Could not DM **${dmErrorCount}** user(s) as their DMs were locked.`);
                });
                
                dmSuccessCount++;
            });

            return message.channel.send(`Successfully messaged **${dmSuccessCount}** user(s).`);
        } else {
            this.client.logger.log('oof');
            message.channel.send('Could not confirm your announcement. Cancelling...').then(msg => msg.delete(3000)).catch(err => this.client.logger.error(err));
            return await message.channel.bulkDelete(6).catch(err => {
                this.client.logger.error(err);
                return message.channel.send(`An error occurred: **${err.message}**`);
            });
        }
    }
};