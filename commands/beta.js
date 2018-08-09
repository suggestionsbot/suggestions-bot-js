const Discord = require('discord.js');
const config = require('../config.json');
let OWNER = config.owner;
let ORANGE = config.embedOrange;

exports.run = (client, message, args) => {

    if(message.author.id !== OWNER) {

       message.channel.send(`Sorry bud, no permissions.`)
       .then(function (message) {
           message.react('🙁')
       })
       .catch(error => {
           console.error
       });
            
    } else {
        message.channel.send('Ye, man. Nice perms ya have there.');
        return;
    }
}