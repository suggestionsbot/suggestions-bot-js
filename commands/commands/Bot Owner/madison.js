const giphy = require('giphy-api')({
  apiKey: process.env.GIPHY,
  https: true
});
const Command = require('../../Command');

module.exports = class MadisonCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'madison',
      category: 'Bot Owner',
      description: 'Simping for Madison Beer?',
      ownerOnly: true,
      guildOnly: false
    });
  }

  async run(message, args) {
    const query = '@madisonbeer';

    try {
      const { data } = await giphy.random(query);
      const url = data.images.original.url;

      message.channel.send({
        embed: {
          color: 0x670A0A,
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
