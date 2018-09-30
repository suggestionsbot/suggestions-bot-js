const { owner } = require('../config.json');
const { maintenanceMode } = require('../utils/errors.js');

exports.run = async (client, message, args) => {

    let status = cmdStatus.get('status');
    if (status === 'off' && message.author.id !== owner) {
        return maintenanceMode(message.channel);
    }

    const msg = await message.channel.send("Ping?");

    msg.edit(`Pong! Latency is \`${msg.createdTimestamp - message.createdTimestamp}ms\`. API Latency is \`${Math.round(client.ping)}ms\`.`);

};

exports.conf = {
    aliases: [],
    status: 'true'
};

exports.help = {
    name: 'ping',
    description: 'View latency of the bot and API',
    usage: 'ping'
};