const index = require('mongoose');

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

    await index.connect(process.env.MONGO_URI, this.client.production ? prodOptions : dbOptions);
    index.Promise = global.Promise;

    this.connection = index.connection;

    index.connection.on('connected', () => {
      Logger.ready('Mongoose connection successfully opened!');
    });

    index.connection.on('err', err => {
      Logger.error('MONGODB', 'Connection Error: \n', err.stack);
    });

    index.connection.on('disconnected', () => {
      Logger.log('Mongoose connection disconnected');
    });

    index.connection.on('close', () => {
      Logger.log.log('Mongoose connection closed');
    });
  }

  async close() {
    await this.connection.close();
  }
};
