const Discord = require('discord.js');
const moment = require('moment');
const Settings = require('../models/settings.js');
const Suggestion = require('../models/suggestions.js');
const Command = require('../models/commands.js');
const { prefix } = settings;

module.exports = async (client, guild) => {

    // 480231440932667393 = Nerd Cave Development Discord
    const logGuild = client.guilds.get('480231440932667393');
    const logChannel = logGuild.channels.find(c => c.name === 'server_logs');

    const gOwnerID = guild.ownerID;
    const bot = guild.members.find(m => m.id === client.user.id);

    function gOwner(mID) {
        if (!mID) return;

        let obj = guild.members.find(m => m.id === mID);
        return `${obj.user.username}#${obj.user.discriminator}`;
    }

    let oldServer = new Discord.RichEmbed()
        .setTitle('Removed')
        .setDescription(`
            **ID:** \`${guild.id}\`
            **Name:** \`${guild}\`
            **Members:** \`${guild.members.size}\`
            **Joined:** \`${moment(bot.joinedAt).fromNow()}\`
            **Owner:** <@${gOwnerID}> \`[${gOwner(gOwnerID)}]\`
        `)
        .setColor('#FF4500')
        .setTimestamp();

    await Settings.findOneAndDelete({ guildID: guild.id }, err => {
        if (err) console.log(err);
        
        console.log(`Settings data deleted for guild ${guild.name} (${guild.id})`);
    });

    await Suggestion.deleteMany({ guildID: guild.id }, err => {
        if (err) console.log(err);

        console.log(`Suggestions data deleted for guild ${guild.name} (${guild.id})`);
    });

    await Command.deleteMany({ guildID: guild.id }, err => {
        if (err) console.log(err);

        console.log(`Command data deleted for guild ${guild.name} (${guild.id})`);
    });
    
    console.log(`${client.user.username} has left a guild: ${guild.name} (${guild.id})`);

    const userSize = client.users.size.toLocaleString();
    const cmdHelp = client.commands.get('help', 'help.name');

    client.user.setStatus('online');
    client.user.setActivity(`${userSize} users | ${prefix + cmdHelp}`, { type: 'WATCHING' })
        .catch(console.error);

    logChannel.send(oldServer);
};