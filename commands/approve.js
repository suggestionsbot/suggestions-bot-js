const Discord = require('discord.js');
const Settings = require('../models/settings.js');
const Suggestion = require('../models/suggestions.js');
const { noSuggestionsPerms, noSuggestionsLogs, noPerms, maintenanceMode } = require('../utils/errors.js');
let cmdStatus = JSON.parse(fs.readFileSync('../cmdStatus.json', 'utf8'));

exports.run = async (client, message, args) => {
    const cmdName = client.commands.get('approve', 'help.name');

    if (cmdStatus.status !== 'on' && message.author.id !== owner) {
        message.delete().catch(O_o=>{});
        return maintenanceMode(message.channel);
    }

    message.delete().catch(O_o=>{});

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
                                ${res.suggestion}
        
                                **Submitter:**
                                <@${sUser.id}>
        
                                **Approved By:**
                                <@${message.author.id}>
                                `)
                            .setColor('#00e640')
                            .setFooter(`sID: ${id}`)
                            .setTimestamp();
        
                        if (embed.footer.text.includes(id)) {
                            suggestionsChannel.fetchMessage(embed.message.id)
                                .then(async m => {
                                    await m.edit(approvedEmbed).then(m.delete(5000));
                                    await message.channel.send(`Suggestion **${args[0]}** has been approved.`).then(message => { message.delete(5000) }).catch(console.error);
                                    await suggestionsLogs.send(logsEmbed);
                                    await sUser.send(dmEmbed);
        
                                })
                                .catch(async err => {
                                    console.log(err);
                                    await message.delete(3000).catch(O_o=>{});
                                    await message.channel.send('Error approving this suggestion!');
                                });
                            return;
                        }
                    });
                });
        
            }).catch(err => {
                console.log(err);
                message.channel.send(`Error approving the suggestion with the ID **${id}**.`);
            });
        });
    });
}

exports.conf = {
    aliases: [],
    status: ''
}

exports.help = {
    name: "approve",
    description: "Approve a submitted suggestion via the suggestion ID",
    usage: "approve <ID>"
}