const Discord = require('discord.js');
const { owner, prefix } = require('../config.json');
const Settings = require('../models/settings');

exports.run = async (client, message, args) => {

    if (message.author.id !== owner) return;
    
    Settings.findOne({
        guildID: message.guild.id,
    }, async (err, res) => {
        if (err) return console.log(err);

        const cmdName = client.commands.get('maintenance', 'help.name');
        if (!args[0]) return message.channel.send(`Usage: \`${res.prefix + cmdName} <on/off>\``).then(m => m.delete(5000)).catch(err => console.log(err)); 
        
        function initiator(user) {
            if (!user) return;

            let obj = client.users.find(u => u.id === owner);
            return `${obj.username}#${obj.discriminator}`;
        }

        let status = cmdStatus.get('status');
        switch (args[0]) {
            case 'on':

                if (status === 'on') return message.channel.send('Maintenance mode is already active.').then(msg => msg.delete(3003));

                message.channel.send('Please type the maintenance message. You have 15 seconds.')
                    .then(async () => {

                        await message.delete().catch(O_o => {});

                        message.channel.awaitMessages(res => (res.author === message.author), {
                                max: 1,
                                time: 15000,
                                errors: ['time']
                            })
                            .then(msg => {

                                let id = msg.first().id;
                                message.channel.fetchMessage(id).then(async m => {

                                    let reason = m.content;
                                    await message.channel.send(`Your maintenance message: 
                                    \`\`\`${reason}\`\`\`
If this is what you want, please type \`confirm\``);

                                    await cmdStatus.set('reason', reason);
                                });
                            })
                            .then(msg => {

                                message.channel.awaitMessages(res => res.content === 'confirm', {
                                        max: 1,
                                        time: 5000,
                                        errors: ['time']
                                    })
                                    .then(() => {

                                        console.log('MAINTENANCE: Activated. Locking all non-essential commands...');
                                        message.channel.send(`***Bot Maintenance Mode activated by __${initiator(owner)}__. All all non-essential commands have been locked.***`)
                                            .then(() => {

                                                cmdStatus.set('status', 'off');

                                            })
                                            .then(() => {

                                                client.user.setStatus('online');
                                                client.user.setActivity('Maintenance Mode...', {
                                                        type: 'WATCHING'
                                                    })
                                                    .catch(console.error);
                                            })
                                            .catch(err => console.log(err));

                                    })
                                    .catch(() => {
                                        message.channel.send('Cancelling. No confirmation...').then(msg => msg.delete(3000));
                                    });
                            })
                            .catch(() => {
                                message.channel.send('Cancelling. No message...').then(msg => msg.delete(3000));
                            });
                    });
            break;
            case 'off':

            if (status === 'on') return message.channel.send('Maintenance mode is not currently active.').then(msg => msg.delete(3003));

                message.channel.send('Please type `confirm` if you would like to proceed with ending maintenance mode. You have 15 seconds.')
                    .then(async () => {
                        await message.delete().catch(O_o => {});
                        message.channel.awaitMessages(res => res.content === 'confirm' && res.author === message.author, {
                                max: 1,
                                time: 15000,
                                errors: ['time'],
                            })
                            .then(() => {
                                console.log('MAINTENANCE: Deactivated. Unlocking all commands...');
                                message.channel.send(`***Bot Maintenance Mode deactivated by __${initiator(owner)}__. All commands have been unlocked.***`)
                                    .then(() => {

                                        cmdStatus.set('status', 'on');
                                        
                                    })
                                    .then(() => {
                                        const userSize = client.users.size.toLocaleString();
                                        const cmdHelp = client.commands.get('help', 'help.name');

                                        client.user.setStatus('online');
                                        client.user.setActivity(`${userSize} users | ${prefix + cmdHelp}`, {
                                                type: 'WATCHING'
                                            })
                                            .catch(console.error);
                                    })
                                    .catch(err => console.log(err));
                            })
                            .catch(() => {
                                message.channel.send('Cancelling. No confirmation...').then(msg => msg.delete(3000));
                            });
                    });
                break;
        }
    });
};

exports.conf = {
    aliases: [],
    status: 'true'
};

exports.help = {
    name: "maintenance",
    description: "Set the bot into maintenance mode",
    usage: "maintenance <on/off>"
};