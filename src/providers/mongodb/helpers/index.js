const MongoDB = require('../index');
const SettingsHelpers = require('./settings');
const BlacklistsHelpers = require('./blacklists');
const SuggestionsHelpers = require('./suggestions');

module.exports = class MongoHelpers {
  constructor(mongo) {
    this.mongo = MongoDB;
    this.settings = new SettingsHelpers(mongo);
    this.blacklists = new BlacklistsHelpers(mongo);
    this.suggestions = new SuggestionsHelpers(mongo);
  }
};
