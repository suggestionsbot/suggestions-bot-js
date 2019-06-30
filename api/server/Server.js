const express = require('express');

const ClientRouter = require('../routes/Client');

module.exports = class Server {
  constructor(client) {
    this.app = express();

    this.client = client;

    this.router = new ClientRouter('/api', this.app, this.client);
  }

  listen(port) {
    return new Promise((res, rej) => {
      // this.app.listen(port, err => err ? rej(err) : res());
      this.app.listen(port, err => {
        if (err) {
          return rej(err);
        } else {
          this.client.logger.log(`Bot API opened on https://localhost:${port}`, 'ready');
          return res();
        }
      });
    });
  }
};
