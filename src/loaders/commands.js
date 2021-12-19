const path = require('path');

const { walk } = require('../utils/functions');
const Logger = require('../utils/logger');

module.exports = class CommandLoader {
  constructor(client) {
    this.client = client;
  }

  static get _directory() {
    return `${path.join(path.dirname(require.main.filename), 'commands')}`;
  }

  init() {
    const files = walk(CommandLoader._directory, ['.js']);
    if (!files.length) return Logger.error('COMMANDS', 'Couldn\'t find any command files!');

    for (const file of files) {
      delete require.cache[file];
      const command = new (require(require.resolve(file)))(this.client);
      this.client.commands.set(command.help.name, command);
      command.conf.aliases.forEach(alias => this.client.aliases.set(alias, command.help.name));
    }
  }
};
