const Discord = require('discord.js');
const Settings = require('../models/settings.js');
const Suggestion = require('../models/suggestions.js');
const { noPerms, maintenanceMode, noSuggestionsPerms } = require('../utils/errors.js');
const { orange, owner } = require('../config.json');

exports.run = async (client, message, args) => {

    let perms = message.guild.me.permissions;
    if (!perms.has('MANAGE_MESSAGES')) return message.channel.send('I can\'t delete messages! Make sure I have this permission: Manage Messages`').then(msg => msg.delete(5000));

    message.delete().catch(O_o=>{});

    let status = cmdStatus.get('status');
    if (status === 'off' && message.author.id !== owner)  return maintenanceMode(message.channel);

    Settings.findOne({
        guildID: message.guild.id,
    }, async (err, res) => {
        if (err) return console.log(err);

        const roles = res.staffRoles;

        const staffRoles = roles.map(el => {
            return message.guild.roles.find(r => r.name === el.role || r.id === el.role);
        });

        let admins = [];
        message.guild.members.forEach(collected => {
            
            if (collected.hasPermission('MANAGE_GUILD') && !collected.user.bot) return admins.push(collected.id);
            
        });

        if (!admins.includes(message.member.id) && !message.member.roles.some(r => staffRoles.includes(r))) return noSuggestionsPerms(message.channel);

        
        Suggestion.find(
            { guildID: message.guild.id }
        ,async (err, res) => {

            if (res.length === 0) return message.channel.send('No suggestions data exists in this guild!').then(msg => msg.delete(3000)).catch(err => console.log(err));

            let approved = [];
            let rejected = [];
            for (let i in res) {
                if (res[i].status === 'approved') approved.push(res[i]);
                if (res[i].status === 'rejected') rejected.push(res[i]);
            }

            const icon = message.guild.icon;
            const id = message.guild.id;
            const srvIcon = `https://cdn.discordapp.com/icons/${id}/${icon}.png?size=2048`;

            const embed = new Discord.RichEmbed()
                .setAuthor(message.guild.name, message.guild.iconURL)
                .setDescription(`
                **Suggestions Data**

                **Total:** ${res.length}

                **Approved:** ${approved.length}

                **Rejected:** ${rejected.length}
                `)
                .setColor(orange)
                .setThumbnail(srvIcon)
                .setFooter(`Guild ID: ${message.guild.id}`)
                .setTimestamp();

            message.channel.send(embed);
        });
    });


};

exports.conf = {
    aliases: []
};

exports.help = {
    name: 'suggestions',
    description: 'View suggestions data in your guild',
    usage: 'suggestions'
};