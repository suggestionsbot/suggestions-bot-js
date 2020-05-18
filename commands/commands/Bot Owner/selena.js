const Command = require('../../Command');

module.exports = class SelenaCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'selena',
      category: 'Bot Owner',
      description: 'Selena the OG!',
      ownerOnly: true,
      guildOnly: false
    });
  }

  async run(message, args) {

    const { giphyKey } = this.client.config;

    const giphy = require('giphy-api')(giphyKey);
    const query = 'selena gomez';

    try {
      const { data } = await giphy.random(query);
      const url = data.images.original.url;

      message.channel.send({
        embed: {
          color: 0x32CD32,
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
