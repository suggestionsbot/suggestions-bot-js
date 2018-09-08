const Discord = require('discord.js');
const {owner, orange} = require('../config.json');
const { noBotPerms } = require('../utils/errors.js');

exports.run = (client, message, args) => {

    //const guildConf = client.settings.get(message.guild.id) || defaultSettings;

    if(message.author.id !== owner) {

       message.channel.send(`Sorry bud, no permissions.`)
       .then(function (message) {
           message.react('🙁')
       })
       .catch(error => {
           console.error
       });
            
    } else {
        //message.channel.send('Ye, man. Nice perms ya have there.');



        //return;
    }
}

exports.conf = {
    aliases: []
}

exports.help = {
    name: 'beta',
    description: 'Used for development testing.',
    usage: 'beta'
};