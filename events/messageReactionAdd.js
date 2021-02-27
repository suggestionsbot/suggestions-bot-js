module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(messageReaction, user) {
    const message = messageReaction.message;
    if (!message.guild) return;
    if (user.bot) return;

    let settings;
    try {
      settings = await this.client.settings.getGuild(guild);
    } catch (err) {
      return this.client.logger.error(err.stack);
    }

    const sChannel = settings.suggestionsChannel && (
      settings.suggestionsChannel === 'suggestions'
        ? await message.guild.channels.fetch({ cache: false })
          .then(res => res.find(c => c.name === 'suggestions'))
        : await message.guild.channels.fetch(settings.suggestionsChannel)
    );
    if (!sChannel || (message.channel.id !== sChannel.id)) return;
    if (messageReaction.partial) await messageReaction.fetch();

    const reactions = await Promise.all(message.reactions.cache.map(r => {
      return r.users.fetch(false).then(res => res.filter(u => u.id === user.id).size)
    }))

    const reactionCount = reactions.reduce((acc, cur) => acc + cur, 0);
    if (reactionCount > 1) return await messageReaction.users.remove(user.id);
  }
};
