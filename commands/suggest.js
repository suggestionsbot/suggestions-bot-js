const Discord = require('discord.js');
const Settings = require('../models/settings.js');
const Suggestion = require('../models/suggestions.js');
const mongoose = require('mongoose');
const crypto = require('crypto');
const { owner, orange, discord } = require('../config.json');
const moment = require('moment');
const { noSuggestions, noBotPerms, maintenanceMode } = require('../utils/errors.js');
require('moment-duration-format');
require('moment-timezone');

exports.run = async (client, message, args) => {

    let status = cmdStatus.get('status');
    if (status === 'off' && message.author.id !== owner)  return maintenanceMode(message.channel);

    const cmdName = client.commands.get('suggest', 'help.name');

    Settings.findOne({
        guildID: message.guild.id,
    }, async (err, res) => {
        if (err) return console.log(err);

        const sUser = message.member;
        const suggestionsChannel = message.guild.channels.find(c => c.name === res.suggestionsChannel) ||  message.guild.channels.find(c => c.toString() === res.suggestionsChannel);
        if (!suggestionsChannel) return noSuggestions(message.channel);
    
        const id = crypto.randomBytes(20).toString('hex').slice(12,20);
        let time = moment(Date.now());
    
        const dmEmbed = new Discord.RichEmbed()
            .setDescription(`Hey, ${sUser}. Your suggestion has been sent to the ${suggestionsChannel} channel to be voted on!
            
            Please wait until it gets approved or rejected by a staff member.
            
            Your suggestion ID (sID) for reference is **${id}**.
            `)
            .setColor(orange)
            .setTimestamp();
    
        const suggestion = args.join(' ');
        if (!suggestion) return message.channel.send(`Usage: \`${res.prefix + cmdName} <suggestion>\``).then(msg => msg.delete(5000)).catch(console.error);
    
        const submittedOn = moment.utc(message.createdAt).format('MM/DD/YY @ h:mm A (z)');
    
        const sEmbed = new Discord.RichEmbed()
            .setThumbnail(sUser.user.avatarURL)
            .setDescription(`
            **Submitter**
            ${sUser.user.tag}
    
            **Suggestion**
            ${suggestion}
    
            **Submitted**
            ${submittedOn}
            `)
            .setColor(orange)
            .setFooter(`User ID: ${sUser.id} | sID: ${id}`);
    
        let perms = message.guild.me.permissions;
        if (!perms.has('EMBED_LINKS')) return message.channel.send('I can\'t embed links! Make sure I have this permission: Embed Links`').then(msg => msg.delete(5000));
        if (!perms.has('ADD_REACTIONS')) return message.channel.send('I can\'t add reactions! Make sure I have this permission: Add Reactions`').then(msg => msg.delete(5000));

        sUser.send(dmEmbed);
    
        suggestionsChannel.send(sEmbed)
            .then(async message => {
                await message.react(`✅`);
                await message.react(`❌`);
            })
            .catch(err => {
                console.log(err);
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

        await newSuggestion.save().then(res => console.log('New Suggestion: \n', res)).catch(err => console.log(err));
        await message.react('✉');
        await message.delete(3000).catch(O_o=>{});
    });
};

exports.conf = {
    aliases: [],
    status: 'true'
};

exports.help = {
    name: 'suggest',
    description: 'Submit a new suggestion',
    usage: 'suggest <suggestion>'
};