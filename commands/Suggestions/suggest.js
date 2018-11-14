const Command = require('../../base/Command');
const { RichEmbed } = require('discord.js');
const Suggestion = require('../../models/suggestions');
const mongoose = require('mongoose');
const crypto = require('crypto');
const moment = require('moment');
const { stripIndents } = require('common-tags');
const { noSuggestions, noBotPerms, noChannelPerms } = require('../../utils/errors');
const { defaultEmojis, thumbsEmojis, arrowsEmojis, christmasEmojis, jingleBellsEmojis } = require('../../utils/voteEmojis');
require('moment-duration-format');
require('moment-timezone');

module.exports = class SuggestCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'suggest',
            category: 'Suggestions',
            description: 'Submit a new suggestion',
            usage: 'suggest <suggestion>'
        });
    }

    async run(message, args) {

        const { embedColor } = this.client.config;

        const cmdUsage = this.help.usage;

        let id = crypto.randomBytes(20).toString('hex').slice(12, 20);
        let time = moment(Date.now());

        let perms = message.guild.me.permissions;
        if (!perms.has('EMBED_LINKS')) return noBotPerms(message, 'EMBED_LINKS');
        if (!perms.has('ADD_REACTIONS')) return noBotPerms(message, 'ADD_REACTIONS');

        let gSettings = await this.client.getSettings(message.guild).catch(err => {
            this.client.logger.error(err);
            return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
        });

        let verifySuggestion = await this.client.getGlobalSuggestion(id).catch(err => {
            this.client.logger.error(err);
            return message.channel.send(`Error querying the database for this guild's suggestions: **${err.message}**.`);
        });

        let { prefix, suggestionsChannel } = gSettings;

        const sUser = message.author;
        const sChannel = message.guild.channels.find(c => c.name === suggestionsChannel) || message.guild.channels.find(c => c.toString() === suggestionsChannel) || message.guild.channels.get(suggestionsChannel);
        if (!sChannel) return noSuggestions(message.channel);

        let emojis = gSettings.voteEmojis;

        // If the sID exists globally, this will force a new one to be generated
        if (verifySuggestion) id = crypto.randomBytes(20).toString('hex').slice(12, 20);

        const dmEmbed = new RichEmbed()
            .setDescription(`Hey, ${sUser}. Your suggestion has been sent to the ${sChannel} channel to be voted on!
            
                Please wait until it gets approved or rejected by a staff member.
            
                Your suggestion ID (sID) for reference is **${id}**.

                'Nuff Said!
            `)
            .setColor(embedColor)
            .setTimestamp();

        const suggestion = args.join(' ');
        if (!suggestion) return message.channel.send(`Usage: \`${prefix + cmdUsage}\``).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err));

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
            .setFooter(`User ID: ${sUser.id} | sID: ${id} | Excelsior`);

        const sendMsgs = sChannel.permissionsFor(message.guild.me).has('SEND_MESSAGES', false);
        const reactions = sChannel.permissionsFor(message.guild.me).has('ADD_REACTIONS', false);
        if (!sendMsgs) return noChannelPerms(message, sChannel, 'SEND_MESSAGES');
        if (!reactions) return noChannelPerms(message, sChannel, 'ADD_REACTIONS');

        sUser.send(dmEmbed).catch(err => {
            this.client.logger.error(err);
            message.channel.send(stripIndents `An error occurred DMing you your suggestion information: **${err.message}**. Please make sure you are able to receive messages from server members.
        
        For reference, your suggestion ID (sID) is **${id}**. Please wait for staff member to approve/reject your suggestion.`).then(msg => msg.delete(5000));
        });

        sChannel.send(sEmbed)
            .then(async msg => {
                if (emojis === 'defaultEmojis' || !emojis) {
                    for (let i in defaultEmojis) {
                        await msg.react(defaultEmojis[i]);
                    }
                }

                if (emojis === 'thumbsEmojis') {
                    for (let i in thumbsEmojis) {
                        await msg.react(thumbsEmojis[i]);
                    }
                }

                if (emojis === 'arrowsEmojis') {
                    for (let i in arrowsEmojis) {
                        await msg.react(arrowsEmojis[i]);
                    }
                }

                if (emojis === 'christmasEmojis') {
                    for (let i in christmasEmojis) {
                        await msg.react(christmasEmojis[i]);
                    }
                }

                if (emojis === 'jingleBellsEmojis') {
                    for (let i in jingleBellsEmojis) {
                        await msg.react(jingleBellsEmojis[i]);
                    }
                }
            })
            .catch(err => {
                this.client.logger.error(err);
                return message.channel.send(`An error occurred adding reactions to this suggestion: **${err.message}**.`);
            });

        const newSuggestion = await new Suggestion({
            _id: mongoose.Types.ObjectId(),
            guildName: message.guild.name,
            guildID: message.guild.id,
            username: message.author.tag,
            userID: sUser.id,
            suggestion: suggestion,
            sID: id,
            time: time
        });

        await newSuggestion.save().then(res => this.client.logger.log(`New suggestion: \n ${res}`)).catch(err => {
            this.client.logger.error(err);
            return message.channel.send(`An error occurred saving this suggestion in the database: **${err.message}**.`);
        });
        await message.react('✉');
        await message.delete(3000).catch(O_o => {});
        return;
    }
};