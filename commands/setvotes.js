const { RichEmbed } = require('discord.js');
const { defaultEmojis, thumbsEmojis, arrowsEmojis, christmasEmojis, jingleBellsEmojis } = require('../utils/voteEmojis');
const Settings = require('../models/settings');
const { noPerms, maintenanceMode, noBotPerms } = require('../utils/errors');
const { owner, embedColor, discord } = require('../config');

exports.run = async (client, message, args) => {

    let status = cmdStatus.get('status');
    if (status === 'off' && message.author.id !== owner)  return maintenanceMode(message.channel);

    await message.delete().catch(O_o => {});

    let perms = message.guild.me.permissions;
    if (!perms.has('MANAGE_MESSAGES')) return noBotPerms(message, 'MANAGE_MESSAGES');
    if (!perms.has('EMBED_LINKS')) return noBotPerms(message, 'EMBED_LINKS');

    let gSettings = await Settings.findOne({ guildID: message.guild.id }).catch(err => {
        console.log(err);
        return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
    });

    const cmdName = client.commands.get('setvotes', 'help.name');

    let admins = [];
    message.guild.members.forEach(collected => { if (collected.hasPermission('MANAGE_GUILD') && !collected.user.bot) return admins.push(collected.id); });

    if (!admins.includes(message.member.id)) return noPerms(message, 'MANAGE_GUILD');

    let embed = new RichEmbed()
        .setAuthor(message.guild.name, message.guild.iconURL)
        .setColor(embedColor)
        .setFooter(`Guild ID: ${message.guild.id}`)
        .setTimestamp();

    if (args[0] === '0') {
        Settings.findOneAndUpdate(
            { guildID: message.guild.id }, 
            { $set: { voteEmojis: 'defaultEmojis' }
            })
            .then(console.log(`The default vote emojis in the guild ${message.guild.name} (${message.guild.id}) has been changed to ${Object.values(defaultEmojis).join(' ')}.`))
            .then(message.channel.send(`The default vote emojis have been changed to ${Object.values(defaultEmojis).join(' ')}.`).then(msg => msg.delete(5000).catch(err => console.log(err))))
            .catch(err => {
                console.log(err);
                message.channel.send(`Error updating the default emoji set: **${err.message}**.`);
            });
        return;
    }

    if (args[0] === '1') {
        Settings.findOneAndUpdate(
            { guildID: message.guild.id }, 
            { $set: { voteEmojis: 'thumbsEmojis' }
            })
            .then(console.log(`The default vote emojis in the guild ${message.guild.name} (${message.guild.id}) has been changed to ${Object.values(thumbsEmojis).join(' ')}.`))
            .then(message.channel.send(`The default vote emojis have been changed to ${Object.values(thumbsEmojis).join(' ')}.`).then(msg => msg.delete(5000).catch(err => console.log(err))))
            .catch(err => {
                console.log(err);
                message.channel.send(`Error updating the default emoji set: **${err.message}**.`);
            });
        return;
    }

    if (args[0] === '2') {
        Settings.findOneAndUpdate(
            { guildID: message.guild.id }, 
            { $set: { voteEmojis: 'arrowsEmojis' }
            })
            .then(console.log(`The default vote emojis in the guild ${message.guild.name} (${message.guild.id}) has been changed to ${Object.values(arrowsEmojis).join(' ')}.`))
            .then(message.channel.send(`The default vote emojis have been changed to ${Object.values(arrowsEmojis).join(' ')}.`).then(msg => msg.delete(5000).catch(err => console.log(err))))
            .catch(err => {
                console.log(err);
                message.channel.send(`Error updating the default emoji set: **${err.message}**.`);
            });
        return;
    }

    if (args[0] === '3') {
        Settings.findOneAndUpdate(
            { guildID: message.guild.id }, 
            { $set: { voteEmojis: 'christmasEmojis' }
            })
            .then(console.log(`The default vote emojis in the guild ${message.guild.name} (${message.guild.id}) has been changed to ${Object.values(christmasEmojis).join(' ')}.`))
            .then(message.channel.send(`The default vote emojis have been changed to ${Object.values(christmasEmojis).join(' ')}.`).then(msg => msg.delete(5000).catch(err => console.log(err))))
            .catch(err => {
                console.log(err);
                message.channel.send(`Error updating the default emoji set: **${err.message}**.`);
            });
        return;
    }

    if (args[0] === '4') {
        Settings.findOneAndUpdate(
            { guildID: message.guild.id }, 
            { $set: { voteEmojis: 'jingleBellsEmojis' }
            })
            .then(console.log(`The default vote emojis in the guild ${message.guild.name} (${message.guild.id}) has been changed to ${Object.values(jingleBellsEmojis).join(' ')}.`))
            .then(message.channel.send(`The default vote emojis have been changed to ${Object.values(jingleBellsEmojis).join(' ')}.`).then(msg => msg.delete(5000).catch(err => console.log(err))))
            .catch(err => {
                console.log(err);
                message.channel.send(`Error updating the default emoji set: **${err.message}**.`);
            });
        return;
    }

    if (!gSettings.voteEmojis || gSettings.voteEmojis === 'defaultEmojis') {
        embed.setDescription(`
            **Voting Emojis**
            Choose from 3 different emoji sets to be used for voting in your guild.
            
            \`0\`: ${Object.values(defaultEmojis).join(' ')} ***(Currently Using)***

            \`1\`: ${Object.values(thumbsEmojis).join(' ')}

            \`2\`: ${Object.values(arrowsEmojis).join(' ')}

            \`3\`: ${Object.values(christmasEmojis).join(' ')}

            \`4\`: ${Object.values(jingleBellsEmojis).join(' ')}

            You can do \`${gSettings.prefix + cmdName} <id>\` to set the desired emojis.
            Submit new emoji set suggestions any time by joining our Discord server: ${discord}
            `);
        return message.channel.send(embed);
    }

    if (gSettings.voteEmojis === 'thumbsEmojis') {
        embed.setDescription(`
            **Voting Emojis**
            Choose from 3 different emoji sets to be used for voting in your guild.
            
            \`0\`: ${Object.values(defaultEmojis).join(' ')}

            \`1\`: ${Object.values(thumbsEmojis).join(' ')} ***(Currently Using)***

            \`2\`: ${Object.values(arrowsEmojis).join(' ')}

            \`3\`: ${Object.values(christmasEmojis).join(' ')}

            \`4\`: ${Object.values(jingleBellsEmojis).join(' ')}

            You can do \`${gSettings.prefix + cmdName} <id>\` to set the desired emojis.
            Submit new emoji set suggestions any time by joining our Discord server: ${discord}
            `);
        return message.channel.send(embed);
    }

    if (gSettings.voteEmojis === 'arrowsEmojis') {
        embed.setDescription(`
            **Voting Emojis**
            Choose from 3 different emoji sets to be used for voting in your guild.
            
            \`0\`: ${Object.values(defaultEmojis).join(' ')}

            \`1\`: ${Object.values(thumbsEmojis).join(' ')}

            \`2\`: ${Object.values(arrowsEmojis).join(' ')} ***(Currently Using)***

            \`3\`: ${Object.values(christmasEmojis).join(' ')}

            \`4\`: ${Object.values(jingleBellsEmojis).join(' ')}

            You can do \`${gSettings.prefix + cmdName} <id>\` to set the desired emojis.
            Submit new emoji set suggestions any time by joining our Discord server: ${discord}
            `);
        return message.channel.send(embed);
    }

    if (gSettings.voteEmojis === 'christmasEmojis') {
        embed.setDescription(`
            **Voting Emojis**
            Choose from 3 different emoji sets to be used for voting in your guild.
            
            \`0\`: ${Object.values(defaultEmojis).join(' ')}

            \`1\`: ${Object.values(thumbsEmojis).join(' ')}

            \`2\`: ${Object.values(arrowsEmojis).join(' ')} 

            \`3\`: ${Object.values(christmasEmojis).join(' ')} ***(Currently Using)***

            \`4\`: ${Object.values(jingleBellsEmojis).join(' ')}

            You can do \`${gSettings.prefix + cmdName} <id>\` to set the desired emojis.
            Submit new emoji set suggestions any time by joining our Discord server: ${discord}
            `);
        return message.channel.send(embed);
    }

    if (gSettings.voteEmojis === 'jingleBellsEmojis') {
        embed.setDescription(`
            **Voting Emojis**
            Choose from 3 different emoji sets to be used for voting in your guild.
            
            \`0\`: ${Object.values(defaultEmojis).join(' ')}

            \`1\`: ${Object.values(thumbsEmojis).join(' ')}

            \`2\`: ${Object.values(arrowsEmojis).join(' ')} 

            \`3\`: ${Object.values(christmasEmojis).join(' ')} 

            \`4\`: ${Object.values(jingleBellsEmojis).join(' ')} ***(Currently Using)***

            You can do \`${gSettings.prefix + cmdName} <id>\` to set the desired emojis.
            Submit new emoji set suggestions any time by joining our Discord server: ${discord}
            `);
        return message.channel.send(embed);
    }
};

exports.help = {
    name: 'setvotes',
    aliases: [],
    description: 'Set custom emojis to use when voting!',
    usage: 'setvotes <#>'
};