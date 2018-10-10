const Discord = require('discord.js');
const Settings = require('../models/settings.js');
const Suggestion = require('../models/suggestions.js');
const {  maintenanceMode } = require('../utils/errors.js');
const { embedColor, owner } = settings;

exports.run = async (client, message, args) => {

    let perms = message.guild.me.permissions;
    if (!perms.has('MANAGE_MESSAGES')) return message.channel.send('I can\'t delete messages! Make sure I have this permission: Manage Messages`').then(msg => msg.delete(5000));

    message.delete().catch(O_o=>{});

    let status = cmdStatus.get('status');
    if (status === 'off' && message.author.id !== owner) return maintenanceMode(message.channel);

    let gSuggestions = await Suggestion.find({ guildID: message.guild.id }).catch(err => {
        console.log(err);
        return message.channel.send(`Error querying the database for this guild's suggestions: **${err.message}**.`);
    });

    if (gSuggestions.length === 0) return message.channel.send('No suggestions data exists in this guild!').then(msg => msg.delete(3000)).catch(err => console.log(err));

    let approved = [];
    let rejected = [];
    for (let i in gSuggestions) {
        if (gSuggestions[i].status === 'approved') approved.push(gSuggestions[i]);
        if (gSuggestions[i].status === 'rejected') rejected.push(gSuggestions[i]);
    }

    const icon = message.guild.icon;
    const id = message.guild.id;
    const srvIcon = `https://cdn.discordapp.com/icons/${id}/${icon}.png?size=2048`;

    const embed = new Discord.RichEmbed()
        .setAuthor(message.guild.name, message.guild.iconURL)
        .setDescription(`
            **Suggestions Data**

            **Total:** ${gSuggestions.length}

            **Approved:** ${approved.length}

            **Rejected:** ${rejected.length}
        `)
        .setColor(embedColor)
        .setThumbnail(srvIcon)
        .setFooter(`Guild ID: ${message.guild.id}`)
        .setTimestamp();

    message.channel.send(embed);
};

exports.help = {
    name: 'suggestions',
    aliases: [],
    description: 'View suggestions data in your guild',
    usage: 'suggestions'
};