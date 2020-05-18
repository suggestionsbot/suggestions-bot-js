const Command = require('../../Command');

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

    const { giphyKey } = this.client.config;

    const giphy = require('giphy-api')(giphyKey);
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
      this.client.logger.error(err.stack);
      return message.channel.send(`Error searching **${query}** on Giphy: **${err.message}**`);
    }

    return;
  }
};
