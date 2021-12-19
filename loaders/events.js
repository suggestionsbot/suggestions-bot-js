const path = require('path');

const { walk } = require('../utils/functions');
const Logger = require('../utils/logger');

module.exports = class EventLoader {
  constructor(client) {
    this.client = client;
    this.skippedEvents = ['debug'];
  }

  static get _directory() {
    return `${path.join(path.dirname(require.main.filename), 'events')}`;
  }

  init() {
    const files = walk(EventLoader._directory, ['.js']);
    if (!files) return Logger.error('Couldn\'t find any event files!');

    for (const file of files) {
      const { name: evtName } = path.parse(file);
      const event = new (require(require.resolve(file)))(this.client);
      this.client.on(evtName, (...args) => event.run(...args));
      delete require.cache[require.resolve(file)];
    }
  }
};
