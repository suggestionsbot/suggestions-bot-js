const { RichEmbed } = require('discord.js');
const moment = require('moment');
const Settings = require('../models/settings');
const Suggestion = require('../models/suggestions');
const { maintenanceMode, noBotPerms } = require('../utils/errors');
const { embedColor, owner } = require('../config');
require('moment-duration-format');
require('moment-timezone');

exports.run = async (client, message, args) => {

    if (message.author.id !== owner) return;

    const cmdName = client.commands.get('gsid', 'help.name');

    let perms = message.guild.me.permissions;
    if (!perms.has('MANAGE_MESSAGES')) return noBotPerms(message, 'MANAGE_MESSAGES');

    message.delete().catch(O_o=>{});

    let status = cmdStatus.get('status');
    if (status === 'off' && message.author.id !== owner)  return maintenanceMode(message.channel);

    let gSettings = await Settings.findOne({ guildID: message.guild.id }).catch(err => {
        console.log(err);
        return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
    });

    let id = args[0];
    if (!id) return message.channel.send(`Usage: \`${gSettings.prefix + cmdName} <id>\``).then(msg => msg.delete(5000)).catch(console.error);

    let gSuggestions = await Suggestion.findOne({ sID: id }).catch(err => {
        console.log(err);
        return message.channel.send(`Error querying the database for this suggestion: **${err.message}**.`);
    });

    if (gSuggestions.length === 0) return message.channel.send('No suggestions data exists in this guild!').then(msg => msg.delete(3000)).catch(err => console.log(err));
    if (gSuggestions.sID === null) return message.channel.send(`The sID **${id}** does not exist in the database.`).then(msg => msg.delete(3000)).catch(err => console.log(err));

    const submittedOn = moment(gSuggestions.time).utc().format('MM/DD/YY @ h:mm A (z)');
    const updatedOn = moment(gSuggestions.statusUpdated).utc().format('MM/DD/YY @ h:mm A (z)');
    let username = gSuggestions.username;
    let userID = gSuggestions.userID;
    let suggestion = gSuggestions.suggestion;
    let updatedBy = gSuggestions.staffMemberUsername;
    let results = gSuggestions.results;
    let guildID = gSuggestions.guildID;

    let guild = client.guilds.get(guildID) || await gSettings.findOne({ guildID: guildID }).catch(console.error);
    if (!guild) return;

    let embed = new RichEmbed()
        .setAuthor(guild.name, guild.iconURL)
        .setTitle(`Info for sID ${id}`)
        .setThumbnail(guild.iconURL)
        .setFooter(`User ID: ${userID} | sID ${id}`);

    if (gSuggestions.status === undefined) {
        await embed.setDescription(`
                **Submitter**
                ${username}
            
                **Suggestion**
                ${suggestion}
        
                **Submitted**
                ${submittedOn}
                
                `);
        await embed.setColor(embedColor);
        return message.channel.send(embed);
    }

    if (gSuggestions.status === 'approved') {

        await embed.setDescription(`
                **Submitter**
                ${username}
    
                **Suggestion**
                ${suggestion}
    
                **Submitted**
                ${submittedOn}

                **Approved**
                ${updatedOn}

                **Approved By**
                ${updatedBy}

                **Results**
                ${results}
                
                `);
        await embed.setColor('#00e640');
        return message.channel.send(embed);
    }

    if (gSuggestions.status === 'rejected') {
        await embed.setDescription(`
                **Submitter**
                ${username}
    
                **Suggestion**
                ${suggestion}
    
                **Submitted**
                ${submittedOn}

                **Rejected**
                ${updatedOn}

                **Rejected By**
                ${updatedBy}

                **Results**
                ${results}
                
                `);
        await embed.setColor('#cf000f');
        return message.channel.send(embed);
    }
};

exports.help = {
    name: 'gsid',
    aliases: [],
    description: 'View the information of a specific suggestion by their sID (globally for admin use)',
    usage: 'gsid <id>'
};