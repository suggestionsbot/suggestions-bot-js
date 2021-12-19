const { Structures } = require('discord.js-light');

module.exports = Structures.extend('Guild', Guild => {
  return class extends Guild {
    constructor(client, data) {
      super(client, data);

      this.guildValues = new Map();
    }

    get settings() {
      return this.guildValues;
    }
  };
});
