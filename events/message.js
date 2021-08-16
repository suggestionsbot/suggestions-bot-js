const { CommandHandler } = require('../monitors');

module.exports = class {
  constructor(client) {
    this.client = client;
    this.commands = new CommandHandler(this.client);
  }

  async run(message) {

    try {
      if (this.client.mongoose.connection.readyState !== 1) await this.commands.run(message);
    } catch (e) {
      this.client.logger.error('you\'re fucking stupid');
    }
  }
};
