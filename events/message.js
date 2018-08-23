const { prefix, token } = require('../config.json');

module.exports = async (client, message) => {

    const cmdCooldown = new Set();
    const cmdSeconds = 5;

    const prefixMention = new RegExp(`^<@!?${client.user.id}> `);
    const newPrefix = message.content.match(prefixMention) ? message.content.match(prefixMention)[0] : prefix;

    if(!message.guild) return;

    if (message.author.bot) return;
    if (message.content.indexOf(newPrefix) !== 0) return;

    const suggestionsChannel = message.guild.channels.find(channel => channel.name === 'suggestions');

    if (message.content.startsWith(`${prefix}suggest`) && suggestionsChannel) {
        console.log(`A new message has been sent in the suggestions channel: 
        Sender: ${message.author.tag}
        Message Content:${message.content.slice(9)}
        Sent At: ${message.createdAt}`);
    } else {
        return;
    }

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

    const cmd = client.commands.get(command);
    if(!cmd) return;

    cmd.run(client, message, args);

    setTimeout(() => {
        cmdCooldown.delete(message.author.id);
    }, cmdSeconds * 1000);

};