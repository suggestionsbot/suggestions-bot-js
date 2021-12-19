const Event = require('../structures/Event');
const { version } = require('../../package.json');
const Logger = require('../utils/logger');

module.exports = class extends Event {
  constructor(client, name) {
    super(client, name);
  }

  async run() {
    const readyMessages = [
      `🔖 Version ${version} of the bot loaded in ${this.client.production ? 'PRODUCTION' : 'DEVELOPMENT'}.`,
      `⚙ Loaded (${this.client.commands.size}) commands!`,
      `👂 Loaded (${this.client.events.size}) events!`
    ];

    try {
      for (const m of readyMessages) await Logger.event(this.name, m);
      Logger.ready(`Logged in as ${this.client.user.tag} (${this.client.user.id}) in ${this.client.guilds.cache.size} guilds.`);
      await this.client.botPresence();
    } catch (e) {
      Logger.error('READY EVENT', e);
    }
  }
};
