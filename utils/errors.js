const Discord = require('discord.js');
const { discord } = require('../config.json');
const fs = require('fs');
const red = '#FF4500';

module.exports.noPerms = (message, perm) => {

    let embed = new Discord.RichEmbed()
        .setTitle('Error')
        .setDescription(message.author + ', you lack certain permissions to do this action.')
        .setColor(red)
        .addField('Permission', `\`${perm}\``);

    message.channel.send(embed).then(m => m.delete(5000)).catch(err => console.log(err));
}

module.exports.noSuggestionsPerms = channel => {

    let embed = new Discord.RichEmbed()
        .setTitle('Error')
        .setDescription(`You lack certain staff roles to do this action.`)
        .setColor(red);
        //.addField('Role', `\`${role}\``);

    channel.send(embed).then(m => m.delete(5000)).catch(err => console.log(err));
}

module.exports.noSuggestions = channel => {

    let embed = new Discord.RichEmbed()
        .setTitle('Error')
        .setDescription('A suggestions channel does not exist! Please create one or contact a server administrator.')
        .setColor(red);
        
    channel.send(embed).then(m => m.delete(5000)).catch(err => console.log(err));
}

module.exports.noSuggestionsLogs = channel => {

    let embed = new Discord.RichEmbed()
        .setTitle('Error')
        .setDescription('A suggestions logs channel does not exist! Please create one or contact a server administrator.')
        .setColor(red);
        
    channel.send(embed).then(m => m.delete(5000)).catch(err => console.log(err));
}

module.exports.maintenanceMode = channel => {

    channel.send(`***MAINTENANCE***
    
    Maintenance mode is currently active due to a database update. If you have any further questions, join the Support Discord:
    
    ${discord}`).then(msg => msg.delete(7500));
}