require('dotenv-flow').config();
const { oneLine } = require('common-tags');
const { BaseCluster } = require('kurasuta');

// const SuggestionsClient = require('./client/SuggestionsClient');
const logger = require('./utils/logger');

require('./extensions/Guild');

module.exports = class extends BaseCluster {
  launch() {
    this.client.login(process.env.DISCORD_TOKEN).catch(e => logger.error(e));

    this.client.on('commandBlocked', (cmd, reason) => {
      this.client.logger.warn(oneLine `
            Command ${cmd ? `${cmd.help.category}:${cmd.help.name}` : ''}
            blocked; ${reason}
        `);
    });
    this.client.on('userBlacklisted', (user, guild, cmd, global = false) => {
      if (global) {
        this.client.logger.warn(oneLine `
            User "${user ? `${user.tag} (${user.id})` : ''}"
             in the
            Guild "${guild ? `${guild.name} (${guild.id})` : ''}"
             tried to use the
            Command "${cmd ? `${cmd.help.category}:${cmd.help.name}` : ''}",
             but is blacklisted from using bot commands globally.
        `);
      } else {
        this.client.logger.warn(oneLine `
            User "${user ? `${user.tag} (${user.id})` : ''}"
             in the
            Guild "${guild ? `${guild.name} (${guild.id})` : ''}"
             tried to use the
            Command "${cmd ? `${cmd.help.category}:${cmd.help.name}` : ''}",
             but is blacklisted from using bot commands in the guild.
        `);
      }
    });
  }
};
