const Server = require('./server/Server');

module.exports = class DashboardClient {
  constructor(client) {
    this.app = new Server(client);

    // this.app.listen(4000);
  }
};
