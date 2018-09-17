const Settings = require('../models/settings.js');

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
                message.delete(1500)
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
    
        cmd.run(client, message, args);
    
        setTimeout(() => {
            cmdCooldown.delete(message.author.id);
        }, cmdSeconds * 1000);
    });
};