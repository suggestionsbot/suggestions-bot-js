const util = require('util');
const Logger = require('../utils/logger');

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(error) {
    Logger.log(`An error event was sent by Discord.js: \n${util.inspect(error)}`, 'error');
  }
};
