const Command = require('../../structures/Command');
const Logger = require('../../utils/logger');
const { getRandomGiphyImage } = require('../../utils/functions');

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
      const url = await getRandomGiphyImage(query);

      return message.channel.send({
        embeds: [{
          color: 0xFF69B4,
          image: { url }
        }]
      });
    } catch (err) {
      Logger.errorCmd(this, err.stack);
      return message.channel.send(`Error searching **${query}** on Giphy: **${err.message}**`);
    }
  }
};
