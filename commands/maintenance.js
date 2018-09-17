const Discord = require('discord.js');
const fs = require('fs');
const { owner, prefix } = require('../config.json');
const Settings = require('../models/settings');

exports.run = async (client, message, args) => {

    message.delete().catch(O_o=>{});

    if (message.author.id !== owner) return;
    
    Settings.findOne({
        guildID: message.guild.id,
    }, (err, res) => {
        if (err) return console.log(err);

        const cmdName = client.commands.get('maintenance', 'help.name');
        if (!args[0]) return message.channel.send(`Usage: \`${res.prefix + cmdName} <on/off>\``).then(m => m.delete(5000)).catch(err => console.log(err)); 
        
        function initiator(user) {
            if (!user) return;

            let obj = client.users.find(u => u.id === owner);
            return `${obj.username}#${obj.discriminator}`;
        }

        let cmds = Array.from(client.commands.keys());
        let aliases = Array.from(client.aliases.keys());
        switch (args[0]) {
            case 'on':
                message.channel.send('Please type `confirm` if you would like to proceed with beginning maintenance mode. You have 15 seconds.')
                    .then(() => {
                        message.delete().catch(O_o => {});
                        message.channel.awaitMessages(res => res.content === 'confirm', {
                                max: 1,
                                time: 15000,
                                errors: ['time'],
                            })
                            .then(() => {
                                console.log('MAINTENANCE: All commands and aliases evicted!');
                                message.channel.send(`***Bot Maintenance Mode activated by __${initiator(owner)}__. All commands and aliases deleted from cache.***`)
                                    .then(() => {
                                        for (let i = 0; i < cmds.length; i++) {
                                            if (cmds[i] === 'maintenance')
                                                continue;

                                            if (cmds[i] === 'suggest')
                                                continue;

                                            if (cmds[i] === 'help')
                                                continue;

                                            if (cmds[i] === 'beta')
                                                continue;

                                            client.commands.delete(cmds[i]);
                                        }

                                        for (let i = 0; i < aliases.length; i++) {
                                            if (aliases[i] === 'h')
                                                continue;

                                            if (aliases[i] === 'halp')
                                                continue;

                                            client.aliases.delete(aliases[i]);
                                        }
                                    })
                                    .then(() => {
                                        client.user.setActivity(`Maintenance Mode...`, {
                                                type: 'WATCHING'
                                            })
                                            .catch(console.error);
                                    })
                            })
                    })
                    .catch(() => {
                        message.channel.send('Failed to confirm within the time period.');
                    });
                break;
            case 'off':

                message.channel.send('Please type `confirm` if you would like to proceed with ending maintenance mode. You have 15 seconds.')
                    .then(() => {
                        message.delete().catch(O_o => {});
                        message.channel.awaitMessages(res => res.content === 'confirm', {
                                max: 1,
                                time: 15000,
                                errors: ['time'],
                            })
                            .then(() => {
                                console.log('MAINTENANCE: Loading all commands and aliases...');
                                message.channel.send(`***Bot Maintenance Mode deactivated by __${initiator(owner)}__. All commands and aliases are loaded.***`)
                                    .then(() => {
                                        fs.readdir('./commands', async (err, files) => {
                                            if (err) return console.error(err);
                                            files.forEach(file => {
                                                if (!file.endsWith('.js')) return;
                                                let props = require(`./${file}`);
                                                let cmdName = file.split('.')[0];
                                                console.log(`Loaded command '${cmdName}'`);
                                                client.commands.set(cmdName, props);
                                                props.conf.aliases.forEach(alias => {
                                                    client.aliases.set(alias, cmdName);
                                                });
                                            });
                                        })
                                    })
                                    .then(() => {
                                        const userSize = client.users.size.toLocaleString();
                                        const cmdHelp = client.commands.get('help', 'help.name');

                                        client.user.setStatus('online');
                                        client.user.setActivity(`${userSize} users | ${prefix + cmdHelp}`, {
                                                type: 'WATCHING'
                                            })
                                            .catch(console.error);
                                    });
                            })
                            .catch(() => {
                                message.channel.send('Failed to confirm within the time period.');
                            });
                    });
                break;
        }
    });
}

exports.conf = {
    aliases: [],
    status: ''
}

exports.help = {
    name: "maintenance",
    description: "Set the bot into maintenance mode",
    usage: "maintenance <on/off>"
}