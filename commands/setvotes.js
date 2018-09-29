const Discord = require('discord.js');
const { defaultEmojis, thumbsEmojis, arrowsEmojis } = require('../utils/voteEmojis');
const Settings = require('../models/settings.js');
const { noPerms, maintenanceMode } = require('../utils/errors.js');
const { owner, orange } = require('../config.json');

exports.run = async (client, message, args) => {

    let status = cmdStatus.get('status');
    if (status === 'off' && message.author.id !== owner)  return maintenanceMode(message.channel);

    await message.delete().catch(O_o => {});

    let perms = message.guild.me.permissions;
    if (!perms.has('MANAGE_MESSAGES')) return message.channel.send('I can\'t delete messages! Make sure I have this permission: Manage Messages`').then(msg => msg.delete(5000));

    Settings.findOne({
        guildID: message.guild.id 
    }, async (err, res) => {
        if (err) return console.log(err);

        const cmdName = client.commands.get('setvotes', 'help.name');

        let admins = [];
        message.guild.members.forEach(collected => {
            
            if (collected.hasPermission('MANAGE_GUILD') && !collected.user.bot) return admins.push(collected.id);
            
        });

        if (!admins.includes(message.member.id)) return noPerms(message, 'MANAGE_GUILD');

        let embed = new Discord.RichEmbed()
            .setAuthor(message.guild.name, message.guild.iconURL)
            .setColor(orange)
            .setFooter(`Guild ID: ${message.guild.id}`)
            .setTimestamp();

        if (args[0] === '0') {
            Settings.findOneAndUpdate(
                { guildID: message.guild.id },
                { $set: { voteEmojis: 'defaultEmojis' } }
            )
            .then(console.log(`The default vote emojis in the guild ${message.guild.name} (${message.guild.id}) has been changed to ${Object.values(defaultEmojis).join(' ')}.`))
            .then(message.channel.send(`The default vote emojis have been changed to ${Object.values(defaultEmojis).join(' ')}.`).then(msg => msg.delete(5000).catch(err => console.log(err))))
            .catch(err => console.log(`Could not update the default emojis in the database.`, err));
            return;
        }

        if (args[0] === '1') {
            Settings.findOneAndUpdate(
                { guildID: message.guild.id },
                { $set: { voteEmojis: 'thumbsEmojis' } }
            )
            .then(console.log(`The default vote emojis in the guild ${message.guild.name} (${message.guild.id}) has been changed to ${Object.values(thumbsEmojis).join(' ')}.`))
            .then(message.channel.send(`The default vote emojis have been changed to ${Object.values(thumbsEmojis).join(' ')}.`).then(msg => msg.delete(5000).catch(err => console.log(err))))
            .catch(err => console.log(`Could not update the default emojis in the database.`, err));
            return;
        }

        if (args[0] === '2') {
            Settings.findOneAndUpdate(
                { guildID: message.guild.id },
                { $set: { voteEmojis: 'arrowsEmojis' } }
            )
            .then(console.log(`The default vote emojis in the guild ${message.guild.name} (${message.guild.id}) has been changed to ${Object.values(arrowsEmojis).join(' ')}.`))
            .then(message.channel.send(`The default vote emojis have been changed to ${Object.values(arrowsEmojis).join(' ')}.`).then(msg => msg.delete(5000).catch(err => console.log(err))))
            .catch(err => console.log(`Could not update the default emojis in the database.`, err));
            return;
        }

        if (!res.voteEmojis || res.voteEmojis === 'defaultEmojis') {
            embed.setDescription(`
            **Voting Emojis**
            Choose from 3 different emoji sets to be used for voting in your guild.
            
            \`0\`: ${Object.values(defaultEmojis).join(' ')} ***(Currently Using)***

            \`1\`: ${Object.values(thumbsEmojis).join(' ')}

            \`2\`: ${Object.values(arrowsEmojis).join(' ')}

            You can do \`${res.prefix + cmdName} <id>\` to set the desired emojis.
            `);
            return message.channel.send(embed);
        }

        if (res.voteEmojis === 'thumbsEmojis') {
            embed.setDescription(`
            **Voting Emojis**
            Choose from 3 different emoji sets to be used for voting in your guild.
            
            \`0\`: ${Object.values(defaultEmojis).join(' ')}

            \`1\`: ${Object.values(thumbsEmojis).join(' ')} ***(Currently Using)***

            \`2\`: ${Object.values(arrowsEmojis).join(' ')}

            You can do \`${res.prefix + cmdName} <id>\` to set the desired emojis.
            `);
            return message.channel.send(embed);
        }

        if (res.voteEmojis === 'arrowsEmojis') {
            embed.setDescription(`
            **Voting Emojis**
            Choose from 3 different emoji sets to be used for voting in your guild.
            
            \`0\`: ${Object.values(defaultEmojis).join(' ')}

            \`1\`: ${Object.values(thumbsEmojis).join(' ')}

            \`2\`: ${Object.values(arrowsEmojis).join(' ')} ***(Currently Using)***

            You can do \`${res.prefix + cmdName} <id>\` to set the desired emojis.
            `);
            return message.channel.send(embed);
        }
    });

};

exports.conf = {
    aliases: []
};

exports.help = {
    name: 'setvotes',
    description: 'Set custom emojis to use when voting!',
    usage: 'setvotes <#>'
};