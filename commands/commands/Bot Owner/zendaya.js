const giphy = require('giphy-api')({
  apiKey: process.env.GIPHY,
  https: true
});
const Command = require('../../Command');
const Logger = require('../../../utils/logger');

module.exports = class ZendayaCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'zendaya',
      category: 'Bot Owner',
      description: 'Oh shit\'s it\'s Zendaya!',
      ownerOnly: true,
      guildOnly: false
    });
  }

  async run(message, args) {
    const query = 'zendaya';

    try {
      const { data } = await giphy.random(query);
      const url = data.images.original.url;

      message.channel.send({
        embed: {
          color: 0xFF69B4,
          image: { url }
        }
      });
    } catch (err) {
      Logger.errorCmd(this, err.stack);
      return message.channel.send(`Error searching **${query}** on Giphy: **${err.message}**`);
    }

    return;
  }
};
