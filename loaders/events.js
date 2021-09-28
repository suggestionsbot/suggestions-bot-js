const { promisify } = require('util');
const readdir = promisify(require('fs').readdir);

module.exports = class EventLoader {
  constructor(client) {
    this.client = client;
    this.skippedEvents = ['debug'];
  }

  async init() {
    let evtFiles = await readdir('./events/');
    if (process.env.NODE_ENV !== 'development') evtFiles = evtFiles.filter(files => !files.includes(this.skippedEvents));
    this.client.logger.log(`Loading a total of ${evtFiles.length} events.`);
    evtFiles.forEach(file => {
      const evtName = file.split('.')[0];
      this.client.logger.log(`Event Loaded: ${evtName}. 👌`);
      const event = new (require(`../events/${file}`))(this.client);
      this.client.on(evtName, (...args) => event.run(...args));
      delete require.cache[require.resolve(`../events/${file}`)];
    });
    return;
  }
};
