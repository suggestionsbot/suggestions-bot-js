const { MessageEmbed, TextChannel, Guild } = require('discord.js');
const moment = require('moment');

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(guild) {
    const { guildStatusColors: { created } } = this.client.config;
    let guildOwner;

    try {
      guildOwner = await this.client.shard.fetchUser(guild.ownerID);
    } catch (error) {
      this.client.logger.error(error.stack);
    }

    const newServer = new MessageEmbed()
      .setTitle('Added')
      .setDescription(`
        **ID:** \`${guild.id}\`
        **Name:** \`${guild.name}\`
        **Members:** \`${guild.members.cache.size}\`
        **Created:** \`${moment(guild.createdAt).fromNow()}\`
        **Owner:** <@${guildOwner.id}> \`[${guildOwner.tag}]\`
      `)
      .setColor(created)
      .setTimestamp();

    // 602332466476482616 = #server_logs / Suggestions
    // 498627833233539086 = #server_logs / Nerd Cave Testing
    this.client.shard.fetchChannel(process.env.NODE_ENV === 'production' ? '602332466476482616' : '498627833233539086')
      .then(found => {
        return this.client.api.guilds(found.guild).get()
          .then(async raw => {
            const fetchedGuild = new Guild(this.client, raw);
            const channel = new TextChannel(fetchedGuild, found);
            return channel.send(newServer);
          });
      }).catch(e => this.client.logger.error(e));
  }
};
