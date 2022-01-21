const Event = require('../structures/Event');
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

    if (message.channel.id !== settings.suggestionsChannel) return;
    if (messageReaction.partial) await messageReaction.fetch();

    const reactions = await message.fetch().then(msg => {
      return Promise.all(msg.reactions.cache.map(reaction => {
        return reaction.users.fetch()
          .then(res => res.filter(u => u.id === user.id).size);
      }));
    });

    const reactionCount = reactions.reduce((acc, cur) => acc + cur, 0);
    if (reactionCount > 1) return await messageReaction.users.remove(user.id);
  }
};
