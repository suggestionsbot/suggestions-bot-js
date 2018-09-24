const fs = require('fs');
const moment = require('moment');
const Settings = require('../models/settings.js');
let blConfig = JSON.parse(fs.readFileSync('./blacklisted.json', 'utf8'));

module.exports = async (client, message) => {

    if(!message.guild) return;

    Settings.findOne({
        guildID: message.guild.id,
    }, (err, prefix) => {
        if (err) return console.log(err);

        const guildConf = prefix || defaultSettings;

        const cmdCooldown = new Set();
        const cmdSeconds = 5;
    
        const prefixMention = new RegExp(`^<@!?${client.user.id}> `);
        const newPrefix = message.content.match(prefixMention) ? message.content.match(prefixMention)[0] : guildConf.prefix;

        if (message.author.bot) return;
        if (message.content.indexOf(newPrefix) !== 0) return;
    
        if (cmdCooldown.has(message.author.id)) {
            message.reply(`slow down there! You need to wait ${cmdSeconds} second(s) before issuing another command. `)
            .then(message => {
                message.delete(1500);
            })
            .catch(error => {
                console.error;
            });
            return message.delete();
        }
    
        if(!message.member.hasPermission('ADMINISTRATOR')) {
            cmdCooldown.add(message.author.id);   
        }
    
        const args = message.content.slice(newPrefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
    
        const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
        if(!cmd) return;

        // fs.readFile('./blacklisted.json', 'utf-8', (err, data) => { if (err) return console.log(err); });

        for (let i in blConfig.cases) {
            if (blConfig.cases[i].id === message.author.id) return console.log(`"${message.author.tag}" (${message.author.id}) in the guild "${message.guild.name}" (${message.guild.id}) tried to use the command "${cmd.help.name}", but is blacklisted. [${moment(message.createdAt)}]`);
        }

        //if (blConfig.cases.id.includes(message.author.id) && message.content.startsWith(cmd)) return console.log(`"${message.author.tag}" (${message.author.id}) in the guild "${message.guild.name}" (${message.guild.id}) tried to use a command, but is blacklisted. [${moment(message.createdAt)}]`);
    
        cmd.run(client, message, args);
    
        setTimeout(() => {
            cmdCooldown.delete(message.author.id);
        }, cmdSeconds * 1000);
    });
};