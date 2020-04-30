const mongoose = require('mongoose');
require('dotenv-flow').config();

module.exports = class Mongoose {
  constructor(client) {
    this.client = client;
    this.connection;
  }

  async init() {
    const dbOptions = {
      useNewUrlParser: true,
      autoIndex: false,
      // reconnectTries: Number.MAX_VALUE,
      // reconnectInterval: 500,
      poolSize: 5,
      connectTimeoutMS: 10000,
      family: 4
    };

    mongoose.connect(process.env.MONGO_URI, dbOptions);
    mongoose.set('useFindAndModify', false);
    mongoose.set('useUnifiedTopology', true);
    mongoose.Promise = global.Promise;

    this.connection = mongoose.connection;

    mongoose.connection.on('connected', () => {
      this.client.logger.log('Mongoose connection successfully opened!', 'ready');
    });

    mongoose.connection.on('err', err => {
      this.client.logger.error(`Mongoose connection error: \n ${err.stack}`);
    });

    mongoose.connection.on('disconnected', () => {
      this.client.logger.log('Mongoose connection disconnected');
    });

    mongoose.connection.on('close', () => {
      console.log('Mongoose connection closed');
    });
  }

  async close() {
    await this.connection.close();
  }
};
