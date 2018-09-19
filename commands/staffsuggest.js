const Discord = require('discord.js');
const Settings = require('../models/settings.js');
const { orange, owner } = require('../config.json');
const { noSuggestionsPerms, maintenanceMode } = require('../utils/errors.js');
const moment = require('moment');
require('moment-duration-format');
require('moment-timezone');

exports.run = async (client, message, args) => {

    let status = cmdStatus.get('status');
    if (status === 'off' && message.author.id !== owner) {
        return maintenanceMode(message.channel);
    }

    const cmdName = client.commands.get('staffsuggest', 'help.name');

        Settings.findOne({
            guildID: message.guild.id,
        }, (err, res) => {
            if (err) return console.log(err);

            const roles = res.staffRoles;

            const staffRoles = roles.map(el => {
                return message.guild.roles.find(r => r.name === el.role || r.id === el.role);
            });

            let admins = [];
            message.guild.members.forEach(collected => {
                if (collected.hasPermission('MANAGE_GUILD') && !collected.user.bot) {
                    
                    admins.push(collected.id);
                }
            });

            if (!staffRoles) return message.channel.send('No staff roles exist! Please create them or contact a server administrator to handle suggestions.').then(msg => {msg.delete(5000);}).catch(err => console.log(err));
            
            if (!admins.includes(message.member.id) && !message.member.roles.some(r => staffRoles.includes(r))) return noSuggestionsPerms(message.channel);

            const staffSuggestionsChannel = message.guild.channels.find(c => c.name === res.staffSuggestionsChannel) || message.guild.channels.find(c => c.toString() === res.staffSuggestionsChannel);

            const sUser = message.member;

            const embed = new Discord.RichEmbed()
                .setDescription(`Hey, ${sUser}. Your suggestion has been added in the ${staffSuggestionsChannel} channel to be voted on!`)
                .setColor(orange)
                .setAuthor(sUser.displayName)
                .setFooter(`User ID: ${sUser.id}`)
                .setTimestamp();

            message.delete().catch(O_o => {});

            const suggestion = args.join(' ');
            if (!suggestion) return message.channel.send(`Usage: \`${res.prefix + cmdName} <suggestion>\``).then(message => {message.delete(5000);}).catch(console.error);

            const submittedOn = moment(message.createdAt).tz('America/New_York').format('MM/DD/YY @ h:mm A (z)');

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
                .setFooter(`User ID: ${sUser.id}`);

            let perms = message.guild.me.permissions;
            if (!perms.has('EMBED_LINKS')) return message.channel.send('I can\'t embed links! Make sure I have this permission: Embed Links`').then(msg => msg.delete(5000));
            if (!perms.has('ADD_REACTIONS')) return message.channel.send('I can\'t add reactions! Make sure I have this permission: Add Reactions`').then(msg => msg.delete(5000));

            message.channel.send(embed).then(message => {
                message.delete(5000);
            })
            .catch(err => {
                console.log(err);
            });

            staffSuggestionsChannel.send(sEmbed)
                .then(async message => {
                    await message.react(`✅`);
                    await message.react(`❌`);
                })
                .catch(err => {
                    console.log(err);
                });

            console.log(`A new staff suggestion has been created in:
        Author: ${sUser.user.tag} (ID: ${sUser.id})
        Suggestion: ${suggestion}
        Time: ${submittedOn}
        Channel: ${staffSuggestionsChannel.name}
        Guild: ${message.guild.name} (ID: ${message.guild.id})`);
    });
};

exports.conf = {
    aliases: [],
    status: 'true'
};

exports.help = {
    name: 'staffsuggest',
    description: 'Submit a new suggestion for staff members to vote',
    usage: 'staffsuggest <suggestion>'
};