module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run() {
    await this.client.botPresence();
  }
};
