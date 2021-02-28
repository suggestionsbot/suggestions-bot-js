const mongoose = require('mongoose');

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
      this.client.logger.log('Mongoose connection successfully opened!', 'ready');
    });

    mongoose.connection.on('err', err => {
      this.client.logger.error(`Mongoose connection error: \n ${err.stack}`);
    });

    mongoose.connection.on('disconnected', () => {
      this.client.logger.log('Mongoose connection disconnected');
    });

    mongoose.connection.on('close', () => {
      this.client.logger.log.log('Mongoose connection closed');
    });
  }

  async close() {
    await this.connection.close();
  }
};
