const Discord = require('discord.js');
const moment = require('moment');
const Settings = require('../models/settings.js');
const Suggestion = require('../models/suggestions.js');
const { noSuggestionsPerms, noSuggestionsLogs, noPerms, maintenanceMode } = require('../utils/errors.js');
const { owner } = require('../config.js');
require('moment-duration-format');
require('moment-timezone');
moment.suppressDeprecationWarnings = true;

exports.run = async (client, message, args) => {

    const cmdName = client.commands.get('approve', 'help.name');

    let perms = message.guild.me.permissions;
    if (!perms.has('MANAGE_MESSAGES')) return message.channel.send('I can\'t delete messages! Make sure I have this permission: Manage Messages`').then(msg => msg.delete(5000));

    message.delete().catch(O_o=>{});

    let status = cmdStatus.get('status');
    if (status === 'off' && message.author.id !== owner)  return maintenanceMode(message.channel);

    let gSettings = await Settings.findOne({
        guildID: message.guild.id,
    }).catch(err => {
        console.log(err);
        return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
    });

    const roles = gSettings.staffRoles;

    const staffRoles = roles.map(el => {
        return message.guild.roles.find(r => r.name === el.role || r.id === el.role);
    });

    let admins = [];
    message.guild.members.forEach(collected => { if (collected.hasPermission('MANAGE_GUILD') && !collected.user.bot) return admins.push(collected.id); });

    if (roles.length === 0 && !admins.includes(message.member.id)) return message.channel.send('No staff roles exist! Please create them or contact a server administrator to handle suggestions.').then(msg => msg.delete(5000));

    if (!admins.includes(message.member.id) && !message.member.roles.some(r => staffRoles.includes(r))) return noSuggestionsPerms(message.channel);

    const suggestionsChannel = message.guild.channels.find(c => c.name === gSettings.suggestionsChannel) || message.guild.channels.find(c => c.toString() === gSettings.suggestionsChannel);
    const suggestionsLogs = message.guild.channels.find(c => c.name === gSettings.suggestionsLogs) || message.guild.channels.find(c => c.toString() === gSettings.suggestionsLogs);
    if (!suggestionsLogs) return noSuggestionsLogs(message.channel);

    let id = args[0];
    let reply = args.slice(1).join(' ');
    if (!id) return message.channel.send(`Usage: \`${gSettings.prefix + cmdName} <id>\``).then(msg => msg.delete(5000)).catch(console.error);

    let date = moment(Date.now()).format();

    let gSuggestions = await Suggestion.findOne({
        $and: [
            { guildID: message.guild.id },
            { sID: id },
        ]
    }).catch(err => {
        console.log(err);
        return message.channel.send(`Error querying the database for this guild's suggestions: **${err.message}**.`);
    });

    if (gSuggestions.status === 'approved') return message.channel.send(`sID **${id}** has already been approved. Cannot do this action again.`).then(msg => msg.delete(3000)).catch(err => console.log(err));

    const sUser = message.guild.members.get(gSuggestions.userID);
    if (!sUser) message.channel.send(`**${gSuggestions.username}** is no longer in the guild, but their suggestion will still be approved.`).then(msg => msg.delete(3000)).catch(console.error);

    let fetchedMessages = await suggestionsChannel.fetchMessages({ limit: 100 }).catch(err => {
        console.log(err);
        return message.channel.send(`There was an error fetching messages from the ${suggestionsChannel}: **${err.message}**.`);
    });

    fetchedMessages.forEach(msg => {

        msg.embeds.forEach(async embed => {

            const approvedEmbed = new Discord.RichEmbed(embed)
                .setTitle('Suggestion Approved')
                .setColor('#00e640');

            const dmEmbed = new Discord.RichEmbed()
                .setDescription(`Hey, ${sUser}. Your suggestion has been approved by <@${message.author.id}>!
                            
                    Your suggestion ID (sID) for reference was **${id}**.
                `)
                .setColor('#00e640')
                .setTimestamp();

            let reactions = embed.message.reactions;

            let reactName = reactions.map(e => e._emoji.name);
            let reactCount = reactions.map(e => e.count);

            let results = reactName.map((r, c) => {
                return `${r} **: ${reactCount[c]-1 || '0'}** \n`;
            });

            const logsEmbed = new Discord.RichEmbed()
                .setAuthor(message.guild.name, message.guild.iconURL)
                .setDescription(`
                    **Results:**
        
                    ${results.join(' ')}
                    **Suggestion:**
                    ${gSuggestions.suggestion}
        
                    **Submitter:**
                    <@${gSuggestions.userID || sUser.id}>
        
                    **Approved By:**
                    <@${message.author.id}>
                `)
                .setColor('#00e640')
                .setFooter(`sID: ${id}`)
                .setTimestamp();

            if (reply) {
                dmEmbed.setDescription(`Hey, ${sUser}. Your suggestion has been approved by <@${message.author.id}>!
    
                    Staff response: **${reply}**
                                
                    Your suggestion ID (sID) for reference was **${id}**.
                `);

                logsEmbed.setDescription(`
                    **Results:**
                    ${results.join(' ')}
                    **Suggestion:**
                    ${gSuggestions.suggestion}
                
                    **Submitter:**
                    <@${gSuggestions.userID || sUser.id}>
    
                    **Approved By:**
                    <@${message.author.id}>

                    **Response:**
                    ${reply}
                `);
            }

            let footer = embed.footer.text;
            if (footer.includes(id)) {

                let sMessage = await suggestionsChannel.fetchMessage(embed.message.id);

                const sendMsgs = suggestionsLogs.permissionsFor(message.guild.me).has('SEND_MESSAGES', false);
                const reactions = suggestionsLogs.permissionsFor(message.guild.me).has('ADD_REACTIONS', false);
                if (!sendMsgs) return message.channel.send(`I can't send messages in the ${suggestionsLogs} channel! Make sure I have \`Send Messages\`.`);
                if (!reactions) return message.channel.send(`I can't add reactions in the ${suggestionsLogs} channel! Make sure I have \`Add Reactions\`.`);

                message.channel.send(`Suggestion **${args[0]}** has been approved.`).then(msg => msg.delete(5000));
                sMessage.edit(approvedEmbed).then(msg => msg.delete(5000));
                suggestionsLogs.send(logsEmbed);
                sUser.send(dmEmbed).catch(err => {
                    console.log(err);
                    message.channel.send(`An error occurred DMing **${sUser.displayName}** their suggestion information: **${err.message}**.`);
                });

                await Suggestion.findOneAndUpdate({
                        $and: [
                            { guildID: message.guild.id },
                            { sID: id }
                        ]}, 
                        { 
                            $set: {
                            status: 'approved',
                            statusUpdated: date,
                            statusReply: reply || null,
                            staffMemberID: message.member.id,
                            staffMemberUsername: message.member.user.tag,
                            results: results.join(' ')
                        }
                    })
                    .then(() => {
                        console.log(`sID ${id} has been approved in the guild "${message.guild.name}" (${message.guild.id}).`);
                        if (reply) console.log(`sID ${id} has been approved in the guild "${message.guild.name}" (${message.guild.id}) with the response "${reply}".`);
                    })   
                    .catch(err => {
                        console.log(err);
                        message.delete(3000).catch(O_o => {});
                        message.channel.send(`Error updating this suggestion in the database: **${err.message}**`);
                    });

                return;
            }
        });
    });
};

exports.help = {
    name: "approve",
    aliases: [],
    description: "Approve a submitted suggestion via the suggestion ID",
    usage: "approve <ID>"
};