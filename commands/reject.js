const Discord = require('discord.js');
const { noSuggestionsPerms, noSuggestionsLogs } = require('../utils/errors.js');

exports.run = async (client, message, args) => {

    const guildConf = client.settings.get(message.guild.id) || defaultSettings;
    const cmdName = client.commands.get('reject', 'help.name');

    message.delete().catch(O_o=>{});

    const suggestionsRole = message.guild.roles.find(r => r.name === guildConf.staffRole);
    if (!suggestionsRole) return message.channel.send('A staff role doesn\'t exist! Please create one or contact a server administrator to handle suggestions.').then(message => { message.delete(5000) }).catch(console.error);
    if (!message.member.roles.has(suggestionsRole.id)) return noSuggestionsPerms(message, guildConf.staffRole);

    if (!client.suggestions.has(message.guild.id)) return message.channel.send('No suggestions data exists!').then(message => { message.delete(5000) }).catch(console.error);

    const sData = client.suggestions.get(message.guild.id);
    let sUser = message.guild.members.get(sData.submitter);

    const suggestionsChannel = message.guild.channels.find(c => c.name === guildConf.suggestionsChannel) ||  message.guild.channels.find(c => c.toString() === guildConf.suggestionsChannel);
    const suggestionsLogs = message.guild.channels.find(c => c.name === guildConf.suggestionsLogs) ||  message.guild.channels.find(c => c.toString() === guildConf.suggestionsLogs);
    if (!suggestionsLogs) return noSuggestionsLogs(message.channel);

    const id = args[0];
    if (!id) return message.channel.send(`Usage: \`${guildConf.prefix + cmdName} <id>\``).then(message => { message.delete(5000) }).catch(console.error);

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
                        ${sData.suggestion}
                        
                        **Submitter:**
                        <@${sUser.id}>
    
                        **Rejected By:**
                        <@${message.author.id}>
                        `)
                    .setColor('#cf000f')
                    .setFooter(`sID: ${id}`)
                    .setTimestamp();

                if (embed.footer.text.includes(id)) {
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
                } else {
                    message.channel.send(`Could not find a suggestion with the ID **${id}**`).then(message => { message.delete(3000) }).catch(console.error);
                }
            });
        });

    }).catch(err => {
        console.log(err);
        message.channel.send('Error rejecting this suggestion!');
    });
}

exports.conf = {
    aliases: []
}

exports.help = {
    name: "reject",
    description: "Reject a submitted suggestions via the suggestion ID",
    usage: "reject <ID>"
}