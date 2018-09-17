const Discord = require('discord.js');
const fs = require('fs');
const Settings = require('../models/settings.js');
const Suggestion = require('../models/suggestions.js')
const { owner, orange } = require('../config.json');
const { noBotPerms, noPerms } = require('../utils/errors.js');
let file = JSON.parse(fs.readFileSync('../cmdStatus.json', 'utf8'));
//let file = fs.readFileSync('../cmdStatus.json', 'utf8');

exports.run = async (client, message, args) => {

    if(message.author.id !== owner /*&& message.author.id !== '275468644132192256'*/) return;

    
    // if (status.status === 'off' && message.author.id !== owner) {
    //     message.delete().catch(O_o=>{});
    //     return maintenanceMode(message.channel);
    // }
            

    //message.channel.send('Ye, man. Nice perms ya have there.');


    let value = args[0];
    let path = '../cmdStatus.json';

    let data = {
        "status": value
    }

    fs.readFile(path, (err, data) => {
        if (err) throw err;

        return status = JSON.parse(data);
        //console.log(status.status);
    });

    // await fs.writeFile(path, JSON.stringify(data), (err) => {
    //     if (err) {
    //         console.log(err);
    //         message.channel.send('Error setting command status!');
    //     }

    //     //console.log(path + ' ' + JSON.stringify(data))

    //     //console.log(`MAINTENANCE: Enabled the ${cmdName} command.`);
    //     //message.channel.send(`***Suggestions command enabled by __${initiator(owner)}__.***`);
    // });

    // //if (file.status !== 'on') return console.log('it is disabled')
    // await console.log(file.status)


    //client.emit('guildCreate', message.guild);
    return;
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