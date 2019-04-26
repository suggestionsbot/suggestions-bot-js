const Command = require('../../Command');
const { RichEmbed } = require('discord.js');
const crypto = require('crypto');
const moment = require('moment');
const { stripIndents } = require('common-tags');
require('moment-duration-format');
require('moment-timezone');

module.exports = class SuggestCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'suggest',
            category: 'Suggestions',
            description: 'Submit a new suggestion',
            usage: 'suggest <suggestion>',
            throttling: {
                usages: 3,
                duration: 60
            },
            botPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS']
        });
        this.voteEmojis = require('../../../utils/voteEmojis');
    }

    async run(message, args, settings) {

        const { embedColor } = this.client.config;
        const voteEmojis = this.voteEmojis(this.client);

        let id = crypto.randomBytes(20).toString('hex').slice(12, 20);
        let time = moment(Date.now());

        let verifySuggestion;
        try {
            verifySuggestion = await this.client.suggestions.getGlobalSuggestion(id);
        } catch (err) {
            this.client.logger.error(err.stack);
            return message.channel.send(`Error querying the database for this guild's suggestions: **${err.message}**.`);
        }

        let { suggestionsChannel } = settings;

        const sUser = message.author;
        const sChannel = message.guild.channels.find(c => c.name === suggestionsChannel) || message.guild.channels.find(c => c.toString() === suggestionsChannel) || message.guild.channels.get(suggestionsChannel);
        if (!sChannel) return this.client.errors.noSuggestions(message.channel);

        let emojis = settings.voteEmojis;

        // If the sID exists globally, this will force a new one to be generated
        if (verifySuggestion) id = crypto.randomBytes(20).toString('hex').slice(12, 20);

        const dmEmbed = new RichEmbed()
            .setAuthor(message.guild, message.guild.iconURL)
            .setDescription(`Hey, ${sUser}. Your suggestion has been sent to the ${sChannel} channel to be voted on!
            
                Please wait until it gets approved or rejected by a staff member.
            
                Your suggestion ID (sID) for reference is **${id}**.
            `)
            .setColor(embedColor)
            .setFooter(`Guild ID: ${message.guild.id} | sID: ${id}`)
            .setTimestamp();

        const suggestion = args.join(' ');
        if (!suggestion) return this.client.errors.noUsage(message.channel, this, settings);

        const submittedOn = moment.utc(message.createdAt).format('MM/DD/YY @ h:mm A (z)');
        
        const imageCheck = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/.exec(suggestion);

        let sEmbed;

        try {
            sEmbed = new RichEmbed()
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
            .setFooter(`User ID: ${sUser.id} | sID: ${id}`);
        } catch (error) {
            message.delete();
            return this.client.errors.suggestionToLong(message.channel);
        }

        if (imageCheck) sEmbed.setImage(imageCheck[0]);
        const sendMsgs = sChannel.permissionsFor(message.guild.me).has('SEND_MESSAGES', false);
        const reactions = sChannel.permissionsFor(message.guild.me).has('ADD_REACTIONS', false);
        if (!sendMsgs) return this.client.errors.noChannelPerms(message, sChannel, 'SEND_MESSAGES');
        if (!reactions) return this.client.errors.noChannelPerms(message, sChannel, 'ADD_REACTIONS');

        try {
            if (settings.dmResponses) sUser.send(dmEmbed);
        } catch (err) {
            this.client.logger.error(err.stack);
            message.channel.send(stripIndents`
                An error occurred DMing you your suggestion information: **${err.message}**. Please make sure you are able to receive messages from server members.
        
                For reference, your suggestion ID (sID) is **${id}**. Please wait for staff member to approve/reject your suggestion.`
            );
        }

        const filter = set => set.name === emojis;
        const defaults = set => set.name === 'defaultEmojis';
        let foundSet = voteEmojis.find(filter) || voteEmojis.find(defaults);
        const emojiSet = foundSet.emojis;

        sChannel.send(sEmbed)
            .then(async msg => {
                for (let i = 0; i < emojiSet.length; i++) await msg.react(emojiSet[i]);
            })
            .catch(err => {
                this.client.logger.error(err.stack);
                return message.channel.send(`An error occurred adding reactions to this suggestion: **${err.message}**.`);
            });

        const newSuggestion = {
            guildID: message.guild.id,
            userID: sUser.id,
            suggestion,
            sID: id,
            newTime: message.createdAt.getTime()
        };

        try {
            await this.client.suggestions.submitGuildSuggestion(newSuggestion);
            if (settings.dmRespones) await message.react('✉');
            await message.delete(3000).catch(O_o => {});
        } catch (err) {
            this.client.logger.error(err.stack);
            return message.channel.send(`An error occurred saving this suggestion in the database: **${err.message}**.`);
        }
        
        return;
    }
};