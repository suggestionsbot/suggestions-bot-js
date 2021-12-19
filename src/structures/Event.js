module.exports = class Event {
  constructor(client, name) {
    this.client = client;
    this.name = name;
  }

  run(...args) {
    throw new Error(`The run method has not been implemented in ${this.name}`);
  }
};
