const Command = require('../../structures/Command');
const Logger = require('../../utils/logger');
const { getRandomGiphyImage } = require('../../utils/functions');

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
      const url = await getRandomGiphyImage(query);

      return message.channel.send({
        embed: {
          color: 0x670A0A,
          image: { url }
        }
      });
    } catch (err) {
      Logger.errorCmd(this, err.stack);
      return message.channel.send(`Error searching **${query}** on Giphy: **${err.message}**`);
    }
  }
};
