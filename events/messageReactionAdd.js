module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(messageReaction, user) {
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

    // let rUsers = (messageReaction.users.cache.size < 1) && await messageReaction.users.fetch({ cache: false })
    // if (messageReaction.users.cache.size < 1) await messageReaction.users.fetch();

    const reactions = await Promise.all(message.reactions.cache.map(r => {
      // return r.users.cache.filter(u => u.id === member.id).size;
      return r.users.fetch({ false }).then(res => res.filter(u => u.id === member.id).size)
    }))

    const reactionCount = reactions.reduce((acc, cur) => acc + cur);
    if (reactionCount > 1) return await messageReaction.users.remove(member.id);
  }
};
