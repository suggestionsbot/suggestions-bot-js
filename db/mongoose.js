const mongoose = require('mongoose');
const Logger = require('../utils/logger');

module.exports = class Mongoose {
  constructor(client) {
    this.client = client;
    this.connection = false;
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

    await mongoose.connect(process.env.MONGO_URI, dbOptions);
    mongoose.Promise = global.Promise;

    this.connection = mongoose.connection;

    mongoose.connection.on('connected', () => {
      Logger.ready('Mongoose connection successfully opened!');
    });

    mongoose.connection.on('err', err => {
      Logger.error('MONGODB', 'Connection Error: \n', err.stack);
    });

    mongoose.connection.on('disconnected', () => {
      Logger.log('Mongoose connection disconnected');
    });

    mongoose.connection.on('close', () => {
      Logger.log.log('Mongoose connection closed');
    });
  }

  async close() {
    await this.connection.close();
  }
};
