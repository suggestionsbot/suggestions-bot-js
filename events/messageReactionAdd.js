module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(messageReaction, user) {
    if (messageReaction.partial) await messageReaction.fetch();

    const message = messageReaction.message;
    const guild = message.guild;
    if (!guild) return;
    const member = guild.members.cache.get(user.id);
    if (!member) await message.guild.members.fetch(user.id);
    if (user.bot) return;

    let settings;
    try {
      settings = await this.client.settings.getGuild(guild);
      // We need to load the user reactions into cache if not available yet
      if (messageReaction.users.cache.size < 1) await messageReaction.users.fetch();
    } catch (err) {
      return this.client.logger.error(err.stack);
    }

    const sChannel = message.guild.channels.cache.find(c => c.name === settings.suggestionsChannel) ||
      message.guild.channels.cache.find(c => c.toString() === settings.suggestionsChannel) ||
      message.guild.channels.cache.get(settings.suggestionsChannel);
    if (!sChannel || (message.channel.id !== sChannel.id)) return;

    const reactions = message.reactions.cache.map(r => {
      return r.users.cache.filter(u => u.id === member.id).size;
    });

    const reactionCount = reactions.reduce((acc, cur) => acc + cur);
    if (reactionCount > 1) return await messageReaction.users.remove(member.id);
  }
};
