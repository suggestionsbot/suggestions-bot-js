const Logger = require('../utils/logger');

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run() {
    Logger.log('Lost connection! Reconnecting...');
  }
};
