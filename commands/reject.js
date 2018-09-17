const Discord = require('discord.js');
const Settings = require('../models/settings.js');
const Suggestion = require('../models/suggestions.js');
const { noSuggestionsPerms, noSuggestionsLogs, maintenanceMode } = require('../utils/errors.js');
let cmdStatus = JSON.parse(fs.readFileSync('../cmdStatus.json', 'utf8'));
const { owner } = require('../config.json');

exports.run = async (client, message, args) => {
    const cmdName = client.commands.get('reject', 'help.name');

    message.delete().catch(O_o=>{});

    Settings.findOne({
        guildID: message.guild.id,
    }, async (err, res) => {
        if (err) console.log(err);

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

        if (!staffRoles) return message.channel.send('No staff roles exist! Please create them or contact a server administrator to handle suggestions.').then(message => {
            message.delete(5000)
        }).catch(err => console.log(err));
        
        if (!admins.includes(message.member.id) && !message.member.roles.some(r => staffRoles.includes(r))) return noSuggestionsPerms(message.channel);

        const suggestionsChannel = message.guild.channels.find(c => c.name === res.suggestionsChannel) || message.guild.channels.find(c => c.toString() === res.suggestionsChannel);
        const suggestionsLogs = message.guild.channels.find(c => c.name === res.suggestionsLogs) ||  message.guild.channels.find(c => c.toString() === res.suggestionsLogs);
        if (!suggestionsLogs) return noSuggestionsLogs(message.channel);

        const id = args[0];
        if (!id) return message.channel.send(`Usage: \`${res.prefix + cmdName} <id>\``).then(message => { message.delete(5000) }).catch(console.error);

        Suggestion.findOne({
            guildID: message.guild.id,
        }, async (err, res) => {
            const sUser = message.guild.members.get(res.userID);

            await suggestionsChannel.fetchMessages({ limit: 100 }).then(collected => {
        
                collected.forEach(msg => {
                    msg.embeds.forEach(embed => {
        
                    const rejectedEmbed = new Discord.RichEmbed(embed)
                        .setTitle('Suggestion Rejected')
                        .setColor('#cf000f');
    
                    const dmEmbed = new Discord.RichEmbed()
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
        
                        const logsEmbed = new Discord.RichEmbed()
                            .setAuthor(message.guild.name, message.guild.iconURL)
                            .setDescription(`
                                **Results:**
        
                                ${results.join(' ')}
                                **Suggestion:**
                                ${res.suggestion}
                            
                                **Submitter:**
                                <@${sUser.id}>
        
                                **Rejected By:**
                                <@${message.author.id}>
                                `)
                            .setColor('#cf000f')
                            .setFooter(`sID: ${id}`)
                            .setTimestamp();
        
                        console.log(footer)
                        if (footer.includes(id)) {
                            suggestionsChannel.fetchMessage(embed.message.id)
                                .then(async m => {
                                    await m.edit(rejectedEmbed).then(m.delete(5000));
                                    await message.channel.send(`Suggestion **${args[0]}** has been rejected.`).then(message => { message.delete(5000) }).catch(console.error);
                                    await suggestionsLogs.send(logsEmbed);
                                    await sUser.send(dmEmbed);
        
                                })
                                .catch(async err => {
                                    console.log(err);
                                    await message.delete(3000).catch(O_o=>{});
                                    await message.channel.send('Error rejecting this suggestion!');
                                });
                            return;
                        }
                    });
                });
        
            }).catch(err => {
                console.log(err);
                message.channel.send(`Error rejecting the suggestion with the ID **${id}**.`);
            });
        });
    });
}


















// exports.run = async (client, message, args) => {

//     const guildConf = client.settings.get(message.guild.id) || defaultSettings;
//     const cmdName = client.commands.get('reject', 'help.name');

//     message.delete().catch(O_o=>{});

//     mongoose.connect('mongodb://localhost/suggestions-data', { 
//         useNewUrlParser: true 
//     });
//     mongoose.set('useFindAndModify', false);

//     const suggestionsRole = message.guild.roles.find(r => r.name === guildConf.staffRole) || message.guild.roles.find(r => r.id === guildConf.staffRole);
//     if (!suggestionsRole) return message.channel.send('A staff role doesn\'t exist! Please create one or contact a server administrator to handle suggestions.').then(message => { message.delete(5000) }).catch(console.error);
//     if (!message.member.roles.has(suggestionsRole.id)) return noSuggestionsPerms(message, guildConf.staffRole);

//     if (!client.suggestions.has(message.guild.id)) return message.channel.send('No suggestions data exists!').then(message => { message.delete(5000) }).catch(console.error);

//     const sData = client.suggestions.get(message.guild.id);
//     let sUser = message.guild.members.get(sData.submitter);

//     const suggestionsChannel = message.guild.channels.find(c => c.name === guildConf.suggestionsChannel) ||  message.guild.channels.find(c => c.toString() === guildConf.suggestionsChannel);
//     const suggestionsLogs = message.guild.channels.find(c => c.name === guildConf.suggestionsLogs) ||  message.guild.channels.find(c => c.toString() === guildConf.suggestionsLogs);
//     if (!suggestionsLogs) return noSuggestionsLogs(message.channel);

//     const id = args[0];
//     if (!id) return message.channel.send(`Usage: \`${guildConf.prefix + cmdName} <id>\``).then(message => { message.delete(5000) }).catch(console.error);

//     await suggestionsChannel.fetchMessages({ limit: 100 }).then(collected => {
        
//         collected.forEach(msg => {
//             msg.embeds.forEach(embed => {

//                 const rejectedEmbed = new Discord.RichEmbed(embed)
//                     .setTitle('Suggestion Rejected')
//                     .setColor('#cf000f');

//                 const dmEmbed = new Discord.RichEmbed()
//                     .setDescription(`Hey, ${sUser}. Unfortunately, your suggestion has been rejected by <@${message.member.id}>.
                    
//                     Your suggestion ID (sID) for reference was **${id}**.
//                     `)
//                     .setColor('#cf000f')
//                     .setTimestamp();

//                 let reactions = embed.message.reactions;

//                 let reactName = reactions.map(e => e._emoji.name);
//                 let reactCount = reactions.map(e => e.count);

//                 let results = reactName.map((r, c) => {
//                     return `${r} **: ${reactCount[c]-1 || '0'}** \n`;
//                 });

//                 const logsEmbed = new Discord.RichEmbed()
//                     .setAuthor(message.guild.name, message.guild.iconURL)
//                     .setDescription(`
//                         **Results:**
    
//                         ${results.join(' ')}
//                         **Suggestion:**
//                         ${sData.suggestion}
                        
//                         **Submitter:**
//                         <@${sUser.id}>
    
//                         **Rejected By:**
//                         <@${message.author.id}>
//                         `)
//                     .setColor('#cf000f')
//                     .setFooter(`sID: ${id}`)
//                     .setTimestamp();

//                 if (embed.footer.text.includes(id)) {
//                     suggestionsChannel.fetchMessage(embed.message.id)
//                         .then(async m => {
//                             await m.edit(rejectedEmbed).then(m.delete(5000));
//                             await message.channel.send(`Suggestion **${args[0]}** has been rejected.`).then(message => { message.delete(5000) }).catch(console.error);
//                             await suggestionsLogs.send(logsEmbed);
//                             await sUser.send(dmEmbed);

//                         })
//                         .catch(async err => {
//                             console.log(err);
//                             await message.delete(3000).catch(O_o=>{});
//                             await message.channel.send('Error rejecting this suggestion!');
//                         });
//                     return;
//                 } else {
//                     message.channel.send(`Could not find a suggestion with the ID **${id}**`).then(message => { message.delete(3000) }).catch(console.error);
//                 }
//             });
//         });

//     }).catch(err => {
//         console.log(err);
//         message.channel.send('Error rejecting this suggestion!');
//     });
// }

exports.conf = {
    aliases: [],
    status: ''
}

exports.help = {
    name: "reject",
    description: "Reject a submitted suggestions via the suggestion ID",
    usage: "reject <ID>"
}