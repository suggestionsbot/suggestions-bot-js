const giphy = require('giphy-api')({
  apiKey: process.env.GIPHY,
  https: true
});
const Command = require('../../Command');
const Logger = require('../../../utils/logger');

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
    const query = '@selenagomez';

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
      Logger.errorCmd(this, err.stack);
      return message.channel.send(`Error searching **${query}** on Giphy: **${err.message}**`);
    }

    return;
  }
};
