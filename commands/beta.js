const Discord = require('discord.js');
const {owner, orange} = require('../config.json');

exports.run = (client, message, args) => {

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
        message.channel.send(`So...
            I guess putting multiple lines
            in a message should be much
            easier at this point with
            template literals?`);
        //return;
    }
}