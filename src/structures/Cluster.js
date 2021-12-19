const { oneLine } = require('common-tags');
const { BaseCluster } = require('kurasuta');

const Logger = require('../utils/logger');

require('../extensions/Guild');

module.exports = class extends BaseCluster {
  launch() {
    this.client.login(process.env.DISCORD_TOKEN).catch(e => Logger.error(e));

    this.client.mongodb.init(); // initialize connection to the database

    this.client.on('commandBlocked', (cmd, reason) => {
      Logger.warning('COMMAND BLOCKED', oneLine `
            Command ${cmd ? `${cmd.help.category}:${cmd.help.name}` : ''}
            blocked; ${reason}
        `);
    });
    this.client.on('userBlacklisted', (user, guild, cmd, global = false) => {
      if (global) {
        Logger.warning('USER BLACKLISTED', oneLine`
            User "${user ? `${user.tag} (${user.id})` : ''}"
             in the
            Guild "${guild ? `${guild.name} (${guild.id})` : ''}"
             tried to use the
            Command "${cmd ? `${cmd.help.category}:${cmd.help.name}` : ''}",
             but is blacklisted from using bot commands globally.
        `);
      } else {
        Logger.warning('USER BLACKLISTED', oneLine`
            User "${user ? `${user.tag} (${user.id})` : ''}"
             in the
            Guild "${guild ? `${guild.name} (${guild.id})` : ''}"
             tried to use the
            Command "${cmd ? `${cmd.help.category}:${cmd.help.name}` : ''}",
             but is blacklisted from using bot commands in the guild.
        `);
      }
    });

    if (!this.client.production && process.env.DEBUG)
      this.client.on('debug', info => Logger.debug('CLUSTER', info));
  }
};
