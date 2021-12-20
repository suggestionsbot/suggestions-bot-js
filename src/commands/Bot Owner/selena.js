const Command = require('../../structures/Command');
const Logger = require('../../utils/logger');
const { getRandomGiphyImage } = require('../../utils/functions');

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
      const url = await getRandomGiphyImage(query);

      return message.channel.send({
        embed: {
          color: 0x32CD32,
          image: { url }
        }
      });
    } catch (err) {
      Logger.errorCmd(this, err.stack);
      return message.channel.send(`Error searching **${query}** on Giphy: **${err.message}**`);
    }
  }
};
