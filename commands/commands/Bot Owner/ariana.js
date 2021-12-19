const giphy = require('giphy-api')({
  apiKey: process.env.GIPHY,
  https: true
});
const Command = require('../../Command');
const Logger = require('../../../utils/logger');

module.exports = class ArianaCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ariana',
      category: 'Bot Owner',
      description: 'Much love to Ariana Grande <3',
      ownerOnly: true,
      guildOnly: false
    });
  }

  async run(message, args) {
    const query = '@arianagrande';

    try {
      const { data } = await giphy.random(query);
      const url = data.images.original.url;

      message.channel.send({
        embed: {
          color: 0xCCCCFF,
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
