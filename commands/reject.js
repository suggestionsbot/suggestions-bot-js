const { RichEmbed } = require('discord.js');
const moment = require('moment');
const Settings = require('../models/settings');
const Suggestion = require('../models/suggestions');
const { noSuggestionsPerms, noSuggestionsLogs, maintenanceMode, noBotPerms } = require('../utils/errors');
const { owner } = require('../config');
require('moment-duration-format');
require('moment-timezone');

exports.run = async (client, message, args) => {
    
    const cmdName = client.commands.get('reject', 'help.name');

    let perms = message.guild.me.permissions;
    if (!perms.has('MANAGE_MESSAGES')) return noBotPerms(message, 'MANAGE_MESSAGES');

    message.delete().catch(O_o=>{});

    let status = cmdStatus.get('status');
    if (status === 'off' && message.author.id !== owner) {
        return maintenanceMode(message.channel);
    }

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
            {  guildID: message.guild.id },
            { sID: id },
        ]
    }).catch(err => {
        console.log(err);
        return message.channel.send(`Error querying the database for this guild's suggestions: **${err.message}**.`);
    });

    if (gSuggestions.status === 'rejected') return message.channel.send(`sID **${id}** has already been rejected. Cannot do this action again.`).then(msg => msg.delete(3000)).catch(err => console.log(err));

    const sUser = message.guild.members.get(gSuggestions.userID);
    if (!sUser) message.channel.send(`**${gSuggestions.username}** is no longer in the guild, but their suggestion will still be rejected.`).then(msg => msg.delete(3000)).catch(console.error);

    let fetchedMessages = await suggestionsChannel.fetchMessages({
        limit: 100
    }).catch(err => {
        console.log(err);
        return message.channel.send(`There was an error fetching messages from the ${suggestionsChannel}: **${err.message}**.`);
    });

    fetchedMessages.forEach(msg => {

        msg.embeds.forEach(async embed => {

            const rejectedEmbed = new RichEmbed(embed)
                .setTitle('Suggestion Rejected')
                .setColor('#cf000f');

            const dmEmbed = new RichEmbed()
                .setDescription(`Hey, ${sUser}. Unfortunately, your suggestion has been rejected by <@${message.member.id}>.
                        
                        Your suggestion ID (sID) for reference was **${id}**.
                        `)
                .setColor('#cf000f')
                .setTimestamp();


            let reactions = embed.message.reactions;

            let reactName = reactions.map(e => e._emoji.name);
            let reactCount = reactions.map(e => e.count);

            let results = reactName.map((r, c) => {
                return `${r} **: ${reactCount[c]-1 || '0'}** \n`;
            });

            const logsEmbed = new RichEmbed()
                .setAuthor(message.guild.name, message.guild.iconURL)
                .setDescription(`
                    **Results:**
        
                    ${results.join(' ')}
                    **Suggestion:**
                    ${gSuggestions.suggestion}
                            
                    **Submitter:**
                    <@${gSuggestions.userID || sUser.id}>
        
                    **Rejected By:**
                    <@${message.author.id}>
                `)
                .setColor('#cf000f')
                .setFooter(`sID: ${id}`)
                .setTimestamp();

            if (reply) {
                dmEmbed.setDescription(`Hey, ${sUser}. Unfortunately, your suggestion has been rejected by <@${message.author.id}>!
        
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
        
                    **Rejected By:**
                    <@${message.author.id}>
    
                    **Response:**
                    ${reply}
                    `);
            }

            let footer = embed.footer.text;
            if (footer.includes(id)) {

                let sMessage = await suggestionsChannel.fetchMessage(embed.message.id).catch(err => console.log(err));

                const sendMsgs = suggestionsLogs.permissionsFor(message.guild.me).has('SEND_MESSAGES', false);
                const reactions = suggestionsLogs.permissionsFor(message.guild.me).has('ADD_REACTIONS', false);
                if (!sendMsgs) return message.channel.send(`I can't send messages in the ${suggestionsLogs} channel! Make sure I have \`Send Messages\`.`);
                if (!reactions) return message.channel.send(`I can't add reactions in the ${suggestionsLogs} channel! Make sure I have \`Add Reactions\`.`);

                message.channel.send(`Suggestion **${args[0]}** has been rejected.`).then(msg => msg.delete(5000)).catch(console.error);
                sMessage.edit(rejectedEmbed).then(msg => msg.delete(5000));
                suggestionsLogs.send(logsEmbed);
                sUser.send(dmEmbed).catch(err => {
                    console.log(err);
                    message.channel.send(`An error occurred DMing **${sUser.displayName}** their suggestion information: **${err.message}**.`);
                });

                await Suggestion.findOneAndUpdate({
                        $and: [
                            { guildID: message.guild.id },
                            { sID: id }
                        ]
                    }, 
                    {
                        $set: {
                            status: 'rejected',
                            statusUpdated: date,
                            statusReply: reply || null,
                            staffMemberID: message.member.id,
                            staffMemberUsername: message.member.user.tag,
                            results: results.join(' ')
                        }
                    })
                    .then(() => {
                        console.log(`sID ${id} has been rejected in the guild "${message.guild.name}" (${message.guild.id}).`);
                        if (reply) console.log(`sID ${id} has been rejected in the guild "${message.guild.name}" (${message.guild.id}) with the response "${reply}".`);
                    })
                    .catch(err => {
                        console.log(err);
                        message.delete(3000).catch(O_o => {});
                        message.channel.send(`Error updating suggest **${id}** in the database: **${err.message}**`);
                    });

                return;
            }
        });
    });
};

exports.help = {
    name: "reject",
    aliases: [],
    description: "Reject a submitted suggestions via the suggestion ID",
    usage: "reject <ID>"
};