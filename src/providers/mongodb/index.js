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

    const mongooseInstance = await mongoose.connect(process.env.MONGO_URI, this.client.production ? prodOptions : dbOptions)
      .then(mongo => {
        Logger.ready('Successfully connected to the MongoDB database!');
        return mongo;
      }).catch(err => Logger.error('MONGODB ERROR', err));

    this.Promise = global.Promise;
    this.connection = mongooseInstance.connection;
  }

  async close() {
    await this.connection.close();
  }
};
