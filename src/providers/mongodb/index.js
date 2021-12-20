const mongoose = require('mongoose');

const MongoHelpers = require('./helpers');
const Logger = require('../../utils/logger');

module.exports = class MongoDB {
  constructor(client) {
    this.client = client;
    this.connection = false;
    this.helpers = new MongoHelpers(this);
  }

  async init() {
    const dbOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      autoIndex: false,
      poolSize: 5,
      connectTimeoutMS: 10000,
      family: 4
    };

    const prodOptions = {
      ...dbOptions,
      ssl: true,
      sslValidate: true,
      sslCA: process.env.MONGO_CERTIFICATE
    };

    const connected = await mongoose.connect(process.env.MONGO_URI, this.client.production ? prodOptions : dbOptions)
      .catch(err => Logger.error('MONGODB ERROR', err));

    this.Promise = global.Promise;
    this.connection = connected.connection;
  }
};
