const { RichEmbed } = require('discord.js');
const moment = require('moment');
const { stripIndents } = require('common-tags');
const Command = require('../../Command');
const { noChannelPerms, noStaffSuggestions } = require('../../../utils/errors');
require('moment-duration-format');
require('moment-timezone');

module.exports = class StaffSuggestCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'staffsuggest',
            category: 'Staff',
            description: 'Submit a new suggestion for staff members to vote.',
            usage: 'staffsuggest <suggestion>',
            staffOnly: true,
            botPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS']
        });
    }

    async run(message, args) {

        const { embedColor } = this.client.config;
        const usage = this.help.usage;

        await message.delete().catch(O_o => {});

        let gSettings = await this.client.getSettings(message.guild).catch(err => {
            this.client.logger.error(err);
            return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
        });
        
        const sUser = message.author;
        const sChannel = message.guild.channels.find(c => c.name === gSettings.staffSuggestionsChannel) || message.guild.channels.find(c => c.toString() === gSettings.staffSuggestionsChannel) || message.guild.channels.get(gSettings.staffSuggestionsChannel);
        if (!sChannel) return noStaffSuggestions(message.channel);

        if (!gSettings.staffRoles) return message.channel.send('No staff roles exist! Please create them or contact a server administrator to handle suggestions.').then(msg =>  msg.delete(5000)).catch(err => this.client.logger.error(err));

        const embed = new RichEmbed()
            .setDescription(`Hey, ${sUser}. Your suggestion has been added in the ${sChannel.toString()} channel to be voted on!`)
            .setColor(embedColor)
            .setAuthor(sUser.displayName)
            .setFooter(`User ID: ${sUser.id}`)
            .setTimestamp();

        const suggestion = args.join(' ');
        if (!suggestion) return message.channel.send(`Usage: \`${gSettings.prefix + usage}\``).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err));

        const submittedOn = moment.utc(message.createdAt).format('MM/DD/YY @ h:mm A (z)');

        const sEmbed = new RichEmbed()
            .setThumbnail(sUser.avatarURL)
            .setDescription(`
            **Submitter**
            ${sUser.tag}

            **Suggestion**
            ${suggestion}

            **Submitted**
            ${submittedOn}
            `)
            .setColor(embedColor)
            .setFooter(`User ID: ${sUser.id}`);

        const sendMsgs = sChannel.permissionsFor(message.guild.me).has('SEND_MESSAGES', false);
        const reactions = sChannel.permissionsFor(message.guild.me).has('ADD_REACTIONS', false);
        if (!sendMsgs) return noChannelPerms(message, sChannel, 'SEND_MESSAGES');
        if (!reactions) return noChannelPerms(message, sChannel, 'ADD_REACTIONS');

        message.channel.send(embed).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err));

        this.client.logger.log(stripIndents`A new staff suggestion has been created:
        Author: ${sUser.tag} (ID: ${sUser.id})
        Suggestion: ${suggestion}
        Time: ${submittedOn}
        Channel: ${sChannel.name}
        Guild: ${message.guild.name} (ID: ${message.guild.id})`);

        return sChannel.send(sEmbed)
            .then(async msg => {
                await msg.react(`✅`);
                await msg.react(`❌`);
            })
            .catch(err => {
                this.client.logger.error(err);
                return message.channel.send(`An error occurred adding reactions to this suggestion: **${err.message}**.`);
            });
    }
};