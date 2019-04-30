const Command = require('../../Command');

module.exports = class ArianaCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ariana',
      category: 'Owner',
      description: 'Much love to Ariana Grande <3',
      ownerOnly: true,
      guildOnly: false
    });
  }

  async run(message, args) {

    const { giphyKey } = this.client.config;

    const giphy = require('giphy-api')(giphyKey);
    const query = 'ariana grande';

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
      this.client.logger.error(err.stack);
      return message.channel.send(`Error searching **${query}** on Giphy: **${err.message}**`);
    }

    return;
  }
};
