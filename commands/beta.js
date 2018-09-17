const Discord = require('discord.js');
const fs = require('fs');
const Settings = require('../models/settings.js');
const {owner, orange} = require('../config.json');
const { noBotPerms, noPerms } = require('../utils/errors.js');

exports.run = async (client, message, args) => {

    if(message.author.id !== owner && message.author.id !== '275468644132192256') {

       message.channel.send(`Sorry bud, no permissions.`)
       .then(function (message) {
           message.react('🙁')
       })
       .catch(error => {
           console.error
       });
            
    } else {
        //message.channel.send('Ye, man. Nice perms ya have there.');

        Settings.findOne({
            guildID: message.guild.id,
        }, (err, res) => {
            if (err) return console.log(err);

            //if (res.cmdStatus === 'true') return console.log('yup!');

            //let cmd = client.commands.get('beta');
        
            if (res.cmdStatus !== 'true' && message.author.id !== owner) return message.channel.send('Command is disabled!');
            message.channel.send('This command is enabled!');

            let value = args[1];

            //console.log(value)
            //if (value.includes('test')) return console.log('ye');
    
            if (args[0] === 'set') {
                if (value === 'true') {

                    Settings.findOneAndUpdate(
                        { guildID: message.guild.id },
                        { cmdStatus: value },
                    ).catch(err => {
                        console.log(err);message.channel.send('Error setting the bot prefix!');
                    });

                    //client.commands.set('beta', value, 'conf.status');
                    message.channel.send('command enabled');
                }
                if (value.includes('false')) {

                    Settings.findOneAndUpdate(
                        { guildID: message.guild.id },
                        { cmdStatus: value },
                    ).catch(err => {
                        console.log(err);message.channel.send('Error setting the bot prefix!');
                    });
                    //client.commands.set('beta', value, 'conf.status');
                    message.channel.send('command disabled');
                }
            }
        })

        //client.emit('guildCreate', message.guild);
        return;
    }
}

exports.conf = {
    aliases: [],
    status: ''
}

exports.help = {
    name: 'beta',
    description: 'Used for development testing.',
    usage: 'beta'
};