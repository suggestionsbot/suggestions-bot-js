const Discord = require('discord.js');
const moment = require('moment');
const Settings = require('../models/settings.js');
const Suggestion = require('../models/suggestions.js');
const {  maintenanceMode } = require('../utils/errors.js');
const { embedColor, owner } = settings;
require('moment-duration-format');
require('moment-timezone');

exports.run = async (client, message, args) => {

    let perms = message.guild.me.permissions;
    if (!perms.has('MANAGE_MESSAGES')) return message.channel.send('I can\'t delete messages! Make sure I have this permission: Manage Messages`').then(msg => msg.delete(5000));

    message.delete().catch(O_o=>{});

    let status = cmdStatus.get('status');
    if (status === 'off' && message.author.id !== owner) return maintenanceMode(message.channel);

    let gSuggestions = await Suggestion.find({
        $and: [
            { guildID: message.guild.id },
            { userID: message.author.id }
        ]
    })
    .sort({ time: -1 })
    .catch(err => {
        console.log(err);
        return message.channel.send(`Error querying the database for your suggestions: **${err.message}**.`);
    });

    if (gSuggestions.length === 0) return message.channel.send('No suggestions data exists for you in this guild!').then(msg => msg.delete(3000)).catch(err => console.log(err));

    let approved = [];
    let rejected = [];
    for (let i in gSuggestions) {
        if (gSuggestions[i].status === 'approved') approved.push(gSuggestions[i]);
        if (gSuggestions[i].status === 'rejected') rejected.push(gSuggestions[i]);
    }

    const lastDate = moment(gSuggestions[0].time).utc().format('MM/DD/YY');
    const lastsID = gSuggestions[0].sID;

    const embed = new Discord.RichEmbed()
        .setAuthor(message.member.user.tag + ' | ' + message.guild.name, message.member.user.avatarURL)
        .setDescription(`
            **Suggestions Data for ${message.member.user.tag}**

            **Total:** ${gSuggestions.length}

            **Approved:** ${approved.length}

            **Rejected:** ${rejected.length}

            **Last Suggestion:** ${lastsID} (${lastDate})
        `)
        .setColor(embedColor)
        .setThumbnail(message.member.user.avatarURL)
        .setFooter(`ID: ${message.author.id}`)
        .setTimestamp();

    message.channel.send(embed);
};

exports.help = {
    name: 'mysuggestions',
    aliases: [],
    description: 'View your own suggestions data',
    usage: 'mysuggestions'
};