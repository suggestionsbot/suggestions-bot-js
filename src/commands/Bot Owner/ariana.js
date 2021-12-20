const Command = require('../../structures/Command');
const Logger = require('../../utils/logger');
const { getRandomGiphyImage } = require('../../utils/functions');

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
      const url = await getRandomGiphyImage(query);

      return message.channel.send({
        embed: {
          color: 0xCCCCFF,
          image: { url }
        }
      });
    } catch (err) {
      Logger.errorCmd(this, err.stack);
      return message.channel.send(`Error searching **${query}** on Giphy: **${err.message}**`);
    }
  }
};
