const Event = require('../structures/Event');

module.exports = class extends Event {
  constructor(client, name) {
    super(client, name);
  }

  async run() {
    await this.client.botPresence();
  }
};
