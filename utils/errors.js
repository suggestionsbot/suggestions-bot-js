const Discord = require('discord.js');
const { discord } = require('../config.js');
const permissions = require('./perms');
const Settings = require('../models/settings');

const colors = {
    red: '#FF4500'
};

async function gRoles(message) {
    const settings = await Settings.findOne({ guildID: message.guild.id }).catch(err => {
        console.log(err);
        return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
    });

    const roles = settings.staffRoles;

    let staffRoles = [];
    roles.forEach(role => {
        let gRole = message.guild.roles.find(r => r.id === role.role);
        if (!gRole) return;

        return staffRoles.push(gRole);
    });

    staffRoles.sort((a, b) => b.position - a.position);

    return staffRoles[staffRoles.length-1].toString();
}

const noPerms = (message, perm) => {

    let embed = new Discord.RichEmbed()
        .setTitle('Error')
        .setDescription(message.author + ', you lack certain permissions to do this action.')
        .setColor(colors.red)
        .addField('Permission', `\`${permissions[perm]} (${perm})\``);

    message.channel.send(embed).then(m => m.delete(5000)).catch(err => console.log(err));
};

const noBotPerms = (message, perm) => {
    message.channel.send(`I am missing a permission! \`${permissions[perm]} (${perm})\``).then(msg => msg.delete(5000));
};

const noSuggestionsPerms = async message => {

    let embed = new Discord.RichEmbed()
        .setTitle('Error')
        .setDescription(`You lack certain staff roles to do this action.`)
        .setColor(colors.red)
        .addField('Lowest Required Role', await gRoles(message));

    message.channel.send(embed).then(m => m.delete(5000)).catch(err => console.log(err));
};

const noChannelPerms = (message, channel, perm) => {
    message.channel.send(`I am missing a permission in the ${channel} channel! Make sure I have \`${permissions[perm]} (${perm})\`.`).then(msg => msg.delete(5000));
};

const noSuggestions = channel => {

    let embed = new Discord.RichEmbed()
        .setTitle('Error')
        .setDescription('A suggestions channel does not exist! Please create one or contact a server administrator.')
        .setColor(colors.red);
        
    channel.send(embed).then(m => m.delete(5000)).catch(err => console.log(err));
};

const noStaffSuggestions = channel => {

    let embed = new Discord.RichEmbed()
        .setTitle('Error')
        .setDescription('A staff suggestions channel does not exist! Please create one or contact a server administrator.')
        .setColor(colors.red);
        
    channel.send(embed).then(m => m.delete(5000)).catch(err => console.log(err));
};

const noSuggestionsLogs = channel => {

    let embed = new Discord.RichEmbed()
        .setTitle('Error')
        .setDescription('A suggestions logs channel does not exist! Please create one or contact a server administrator.')
        .setColor(colors.red);
        
    channel.send(embed).then(m => m.delete(5000)).catch(err => console.log(err));
};

const maintenanceMode = channel => {

    let reason = cmdStatus.get('reason');

    channel.send(`***MAINTENANCE***
    
    Maintenance mode is currently active due to this reason: **${reason}**
    
    If you have any further questions, please join the Support Discord: ${discord}`).then(msg => msg.delete(7500));
};

module.exports = {
    noPerms,
    noBotPerms,
    noChannelPerms,
    noSuggestions,
    noSuggestionsPerms,
    noSuggestionsLogs,
    noStaffSuggestions,
    maintenanceMode
};