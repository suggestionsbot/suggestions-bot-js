module.exports = class {
  constructor(client) {
    this.client = client;
  }

  run(info) {
    this.client.logger.debug(info);
  }
};
