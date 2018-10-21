const { RichEmbed } = require('discord.js');
const Settings = require('../models/settings');
const Suggestion = require('../models/suggestions');
const mongoose = require('mongoose');
const crypto = require('crypto');
const { owner, embedColor } = require('../config');
const moment = require('moment');
const { stripIndents } = require('common-tags');
const { noSuggestions, noBotPerms, maintenanceMode } = require('../utils/errors');
const { defaultEmojis, thumbsEmojis, arrowsEmojis, halloweenEmojis, impEmojis } = require('../utils/voteEmojis');
require('moment-duration-format');
require('moment-timezone');

exports.run = async (client, message, args) => {

    let status = cmdStatus.get('status');
    if (status === 'off' && message.author.id !== owner)  return maintenanceMode(message.channel);

    const cmdName = client.commands.get('suggest', 'help.name');

    let perms = message.guild.me.permissions;
    if (!perms.has('EMBED_LINKS')) return message.channel.send('I can\'t embed links! Make sure I have this permission: Embed Links`').then(msg => msg.delete(5000));
    if (!perms.has('ADD_REACTIONS')) return message.channel.send('I can\'t add reactions! Make sure I have this permission: Add Reactions`').then(msg => msg.delete(5000));

    let gSettings = await Settings.findOne({ guildID: message.guild.id }).catch(err => {
        console.log(err);
        return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
    });

    const sUser = message.member;
    const suggestionsChannel = message.guild.channels.find(c => c.name === gSettings.suggestionsChannel) || message.guild.channels.find(c => c.toString() === gSettings.suggestionsChannel);
    if (!suggestionsChannel) return noSuggestions(message.channel);

    let emojis = gSettings.voteEmojis;

    const id = crypto.randomBytes(20).toString('hex').slice(12, 20);
    let time = moment(Date.now());

    const dmEmbed = new RichEmbed()
        .setDescription(`Hey, ${sUser}. Your suggestion has been sent to the ${suggestionsChannel} channel to be voted on!
            
            Please wait until it gets approved or rejected by a staff member.
            
            Your suggestion ID (sID) for reference is **${id}**.
        `)
        .setColor(embedColor)
        .setTimestamp();

    const suggestion = args.join(' ');
    if (!suggestion) return message.channel.send(`Usage: \`${gSettings.prefix + cmdName} <suggestion>\``).then(msg => msg.delete(5000)).catch(console.error);

    const submittedOn = moment.utc(message.createdAt).format('MM/DD/YY @ h:mm A (z)');

    const sEmbed = new RichEmbed()
        .setThumbnail(sUser.user.avatarURL)
        .setDescription(`
            **Submitter**
            ${sUser.user.tag}
    
            **Suggestion**
            ${suggestion}
    
            **Submitted**
            ${submittedOn}
        `)
        .setColor(embedColor)
        .setFooter(`User ID: ${sUser.id} | sID: ${id}`);

    const sendMsgs = suggestionsChannel.permissionsFor(message.guild.me).has('SEND_MESSAGES', false);
    const reactions = suggestionsChannel.permissionsFor(message.guild.me).has('ADD_REACTIONS', false);
    if (!sendMsgs) return message.channel.send(`I can't send messages in the ${suggestionsChannel} channel! Make sure I have \`Send Messages\`.`);
    if (!reactions) return message.channel.send(`I can't add reactions in the ${suggestionsChannel} channel! Make sure I have \`Add Reactions\`.`);

    sUser.send(dmEmbed).catch(err => {
        console.log(err);
        message.channel.send(stripIndents`An error occurred DMing you your suggestion information: **${err.message}**. Please make sure you are able to receive messages from server members.
        
        For reference, your suggestion ID (sID) is **${id}**. Please wait for staff member to approve/reject your suggestion.`).then(msg => msg.delete(5000));
    });

    suggestionsChannel.send(sEmbed)
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

            if (emojis === 'halloweenEmojis') {
                for (let i in halloweenEmojis) {
                    await msg.react(halloweenEmojis[i]);
                }
            }

            if (emojis === 'impEmojis') {
                for (let i in impEmojis) {
                    await msg.react(impEmojis[i]);
                }
            }
        })
        .catch(err => {
            console.log(err);
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

    await newSuggestion.save().then(res => console.log('New suggestion: \n', res)).catch(err => {
        console.log(err);
        return message.channel.send(`An error occurred saving this suggestion in the database: **${err.message}**.`);
    });
    await message.react('✉');
    await message.delete(3000).catch(O_o => {});
};

exports.help = {
    name: 'suggest',
    aliases: [],
    description: 'Submit a new suggestion',
    usage: 'suggest <suggestion>'
};