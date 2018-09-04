const Discord = require('discord.js');
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

module.exports.noSuggestions = channel => {

    let embed = new Discord.RichEmbed()
        .setTitle('Error')
        .setDescription('A suggestions channel does not exist! Please create one or contact a server administrator.')
        .setColor(red);
        
    channel.send(embed).then(m => m.delete(5000)).catch(err => console.log(err));
}