const Event = require('../structures/Event');
const { CommandHandler } = require('../monitors');
const Logger = require('../utils/logger');

module.exports = class extends Event {
  constructor(client, name) {
    super(client, name);

    this.commands = new CommandHandler(this.client);
  }

  async run(message) {

    try {
      if (this.client.mongodb.connection.readyState === 1) await this.commands.run(message);
    } catch (e) {
      Logger.error('MESSAGE', e.stack);
    }
  }
};
