const { MessageEmbed, Guild, TextChannel } = require('discord.js');
const moment = require('moment');

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(guild) {

    const { guildStatusColors: { deleted } } = this.client.config;

    let guildOwner;

    try {
      guildOwner = await this.client.shard.fetchUser(guild.ownerID);
    } catch (error) {
      this.client.logger.error(error.stack);
    }

    const oldServer = new MessageEmbed()
      .setTitle('Removed')
      .setDescription(`
        **ID:** \`${guild.id}\`
        **Name:** \`${guild}\`
        **Members:** \`${guild.members.cache.size}\`
        **Joined:** \`${moment(this.client.user.joinedAt).fromNow()}\`
        **Owner:** <@${guildOwner.id}> \`[${guildOwner.tag}]\`
      `)
      .setColor(deleted)
      .setTimestamp();

    try {
      await this.client.settings.deleteGuild(guild);
      await this.client.shard.fetchChannel(process.env.NODE_ENV === 'production' ? '602332466476482616' : '498627833233539086')
        .then(found => {
          return this.client.api.guilds(found.guild).get()
            .then(async raw => {
              const fetchedGuild = new Guild(this.client, raw);
              const channel = new TextChannel(fetchedGuild, found);
              return channel.send(oldServer);
            });
        });
    } catch (err) {
      this.client.logger.error(err.stack);
    }
  }
};
