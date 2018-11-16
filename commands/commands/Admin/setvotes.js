const { RichEmbed } = require('discord.js');
const { defaultEmojis, thumbsEmojis, arrowsEmojis, christmasEmojis, jingleBellsEmojis } = require('../../../utils/voteEmojis');
const Command = require('../../Command');

module.exports = class SetVotes extends Command {
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

        let gSettings = await this.client.getSettings(message.guild).catch(err => {
            this.client.logger.error(err);
            return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
        });

        const usage = this.help.usage;

        let embed = new RichEmbed()
            .setAuthor(message.guild.name, message.guild.iconURL)
            .setColor(embedColor)
            .setFooter(`Guild ID: ${message.guild.id}`)
            .setTimestamp();

        switch (args[0]) {
            case '0': 
                await this.client.writeSettings(message.guild, { voteEmojis: 'defaultEmojis' }).catch(err => {
                    this.client.logger.error(err);
                    return message.channel.send(`Error updating the default emoji set: **${err.message}**.`);
                });

                this.client.logger.log(`The default vote emojis in the guild ${message.guild.name} (${message.guild.id}) has been changed to ${Object.values(defaultEmojis).join(' ')}.`);
                message.channel.send(`The default vote emojis have been changed to ${Object.values(defaultEmojis).join(' ')}.`).then(msg => msg.delete(5000).catch(err => this.client.logger.error(err)));
                break;
            case '1':
                await this.client.writeSettings(message.guild, { voteEmojis: 'thumbsEmojis' }).catch(err => {
                    this.client.logger.error(err);
                    return message.channel.send(`Error updating the default emoji set: **${err.message}**.`);
                });

                this.client.logger.log(`The default vote emojis in the guild ${message.guild.name} (${message.guild.id}) has been changed to ${Object.values(thumbsEmojis).join(' ')}.`);
                message.channel.send(`The default vote emojis have been changed to ${Object.values(thumbsEmojis).join(' ')}.`).then(msg => msg.delete(5000).catch(err => this.client.logger.error(err)));
                break;
            case '2':
                await this.client.writeSettings(message.guild, { voteEmojis: 'arrowsEmojis' }).catch(err => {
                    this.client.logger.error(err);
                    return message.channel.send(`Error updating the default emoji set: **${err.message}**.`);
                });

                this.client.logger.log(`The default vote emojis in the guild ${message.guild.name} (${message.guild.id}) has been changed to ${Object.values(arrowsEmojis).join(' ')}.`);
                message.channel.send(`The default vote emojis have been changed to ${Object.values(arrowsEmojis).join(' ')}.`).then(msg => msg.delete(5000).catch(err => this.client.logger.error(err)));
                break;
            case '3':
                await this.client.writeSettings(message.guild, { voteEmojis: 'christmasEmojis' }).catch(err => {
                    this.client.logger.error(err);
                    return message.channel.send(`Error updating the default emoji set: **${err.message}**.`);
                });

                this.client.logger.log(`The default vote emojis in the guild ${message.guild.name} (${message.guild.id}) has been changed to ${Object.values(christmasEmojis).join(' ')}.`);
                message.channel.send(`The default vote emojis have been changed to ${Object.values(christmasEmojis).join(' ')}.`).then(msg => msg.delete(5000).catch(err => this.client.logger.error(err)));
                break;
            case '4':
                await this.client.writeSettings(message.guild, { voteEmojis: 'jingleBellsEmojis' }).catch(err => {
                    this.client.logger.error(err);
                    return message.channel.send(`Error updating the default emoji set: **${err.message}**.`);
                });

                this.client.logger.log(`The default vote emojis in the guild ${message.guild.name} (${message.guild.id}) has been changed to ${Object.values(jingleBellsEmojis).join(' ')}.`);
                message.channel.send(`The default vote emojis have been changed to ${Object.values(jingleBellsEmojis).join(' ')}.`).then(msg => msg.delete(5000).catch(err => this.client.logger.error(err)));
                break;
        }


        if (!gSettings.voteEmojis || gSettings.voteEmojis === 'defaultEmojis') {
            embed.setDescription(`
            **Voting Emojis**
            Choose from 5 different emoji sets to be used for voting in your guild.
            
            \`0\`: ${Object.values(defaultEmojis).join(' ')} ***(Currently Using)***

            \`1\`: ${Object.values(thumbsEmojis).join(' ')}

            \`2\`: ${Object.values(arrowsEmojis).join(' ')}

            \`3\`: ${Object.values(christmasEmojis).join(' ')}

            \`4\`: ${Object.values(jingleBellsEmojis).join(' ')}

            You can do \`${gSettings.prefix + usage}\` to set the desired emojis.
            Submit new emoji set suggestions any time by joining our Discord server: ${discord}
            `);
            return message.channel.send(embed);
        }

        if (gSettings.voteEmojis === 'thumbsEmojis') {
            embed.setDescription(`
            **Voting Emojis**
            Choose from 5 different emoji sets to be used for voting in your guild.
            
            \`0\`: ${Object.values(defaultEmojis).join(' ')}

            \`1\`: ${Object.values(thumbsEmojis).join(' ')} ***(Currently Using)***

            \`2\`: ${Object.values(arrowsEmojis).join(' ')}

            \`3\`: ${Object.values(christmasEmojis).join(' ')}

            \`4\`: ${Object.values(jingleBellsEmojis).join(' ')}

            You can do \`${gSettings.prefix + usage}\` to set the desired emojis.
            Submit new emoji set suggestions any time by joining our Discord server: ${discord}
            `);
            return message.channel.send(embed);
        }

        if (gSettings.voteEmojis === 'arrowsEmojis') {
            embed.setDescription(`
            **Voting Emojis**
            Choose from 5 different emoji sets to be used for voting in your guild.
            
            \`0\`: ${Object.values(defaultEmojis).join(' ')}

            \`1\`: ${Object.values(thumbsEmojis).join(' ')}

            \`2\`: ${Object.values(arrowsEmojis).join(' ')} ***(Currently Using)***

            \`3\`: ${Object.values(christmasEmojis).join(' ')}

            \`4\`: ${Object.values(jingleBellsEmojis).join(' ')}

            You can do \`${gSettings.prefix + usage}\` to set the desired emojis.
            Submit new emoji set suggestions any time by joining our Discord server: ${discord}
            `);
            return message.channel.send(embed);
    }

        if (gSettings.voteEmojis === 'christmasEmojis') {
            embed.setDescription(`
            **Voting Emojis**
            Choose from 5 different emoji sets to be used for voting in your guild.
            
            \`0\`: ${Object.values(defaultEmojis).join(' ')}

            \`1\`: ${Object.values(thumbsEmojis).join(' ')}

            \`2\`: ${Object.values(arrowsEmojis).join(' ')} 

            \`3\`: ${Object.values(christmasEmojis).join(' ')} ***(Currently Using)***

            \`4\`: ${Object.values(jingleBellsEmojis).join(' ')}

            You can do \`${gSettings.prefix + usage}\` to set the desired emojis.
            Submit new emoji set suggestions any time by joining our Discord server: ${discord}
            `);
            return message.channel.send(embed);
        }

        if (gSettings.voteEmojis === 'jingleBellsEmojis') {
            embed.setDescription(`
            **Voting Emojis**
            Choose from 5 different emoji sets to be used for voting in your guild.
            
            \`0\`: ${Object.values(defaultEmojis).join(' ')}

            \`1\`: ${Object.values(thumbsEmojis).join(' ')}

            \`2\`: ${Object.values(arrowsEmojis).join(' ')} 

            \`3\`: ${Object.values(christmasEmojis).join(' ')} 

            \`4\`: ${Object.values(jingleBellsEmojis).join(' ')} ***(Currently Using)***

            You can do \`${gSettings.prefix + usage}\` to set the desired emojis.
            Submit new emoji set suggestions any time by joining our Discord server: ${discord}
            `);
            return message.channel.send(embed);
        }
        return;
    }
};