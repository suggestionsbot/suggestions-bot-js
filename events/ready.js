const { version } = require('../package.json');
const Logger = require('../utils/logger');

const versions = {
  production: 'Production',
  development: 'Development'
};

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run() {
    const guildCount = this.client.guilds.cache.size;

    await Logger.ready(`Version ${version} of the bot loaded.`);
    await Logger.ready(`${versions[process.env.NODE_ENV]} version of the bot loaded.`);
    await Logger.ready(`Logged in as ${this.client.user.tag} (${this.client.user.id}) in ${guildCount} server(s) on shard ${this.client.shard.shards[0]}.`, 'ready');

    await this.client.botPresence();
  }
};
