const Event = require('../structures/Event');
const { validateChannel } = require('../utils/functions');
const Logger = require('../utils/logger');

module.exports = class extends Event {
  constructor(client, name) {
    super(client, name);
  }

  async run(messageReaction, user) {
    const message = messageReaction.message;
    if (!message.guild) return;
    if (user.bot) return;

    let settings;
    try {
      settings = await this.client.mongodb.helpers.settings.getGuild(message.guild);
    } catch (err) {
      Logger.error('MESSAGE_REACTION_ADD', err.stack);
      return;
    }

    const sChannel = settings.suggestionsChannel && await validateChannel(message.guild.channels, settings.suggestionsChannel);
    if (!sChannel || (message.channel.id !== sChannel.id)) return;
    if (messageReaction.partial) await messageReaction.fetch();

    const reactions = await Promise.all(message.reactions.cache.map(r => {
      return r.users.fetch(false).then(res => res.filter(u => u.id === user.id).size);
    }));

    const reactionCount = reactions.reduce((acc, cur) => acc + cur, 0);
    if (reactionCount > 1) return await messageReaction.users.remove(user.id);
  }
};
