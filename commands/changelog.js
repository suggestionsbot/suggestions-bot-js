const { RichEmbed } = require('discord.js');
const { embedColor, discord } = require('../config');
require('dotenv-flow').config();

exports.run = async (client, message, args) => {

    // Find a better way to use both production and dev servers
    let g = client.guilds.get('480231440932667393');
    let c = g.channels.find(c => c.name === 'updates');
    let lastUpdateID = c.lastMessageID;
    let lastUpdate = await c.fetchMessage(lastUpdateID);
    let update = lastUpdate.embeds[0].description;
    let date = lastUpdate.embeds[0].fields[0].value;
    
    let prefix = '**>**';
    let rawUpdate = update.toString().split('\n');
    let updates = [];
    rawUpdate.filter(u => {
        if (!u.startsWith(prefix)) return;
        updates.push(u);
    });

    let changelogEmbed = new RichEmbed()
        .setTitle(`${client.user.username} Changelog 🗄`)
        .setThumbnail(client.user.avatarURL)
        .setDescription(updates.join('\n'))
        .addField('Date', date)
        .setColor(embedColor);

    if (message.guild.id === '480231440932667393') {
        changelogEmbed.addField('More Information', `Please check our <#480261164362760202> channel at ${discord} for previous updates!`);
    } else {
        changelogEmbed.addField('More Information', `Please check our \`#updates\` channel at ${discord} for previous updates!`);
    }
    
    message.channel.send(changelogEmbed);
};

exports.help = {
    name: 'changelog',
    aliases: ['changes', 'updates', 'changelogs'],
    description: 'View the recent changelog for the bot.',
    usage: 'changelog'
};