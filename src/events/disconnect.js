const Event = require('../structures/Event');
const Logger = require('../utils/logger');

module.exports = class extends Event {
  constructor(client, name) {
    super(client, name);
  }

  async run() {
    Logger.log('Bot is disconnecting...');
  }
};
