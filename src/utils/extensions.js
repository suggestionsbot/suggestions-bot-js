const mongoose = require('mongoose');
const Logger = require('./Logger');

mongoose.connection.on('connected', () => {
  Logger.ready('MONGOOSE', 'Connection successfully opened!');
});

mongoose.connection.on('err', (err) => {
  Logger.error('MONGOOSE', 'Connection error', err);
});

mongoose.connection.on('disconnected', () => {
  Logger.event('MONGOOSE', 'Mongoose connection disconnected');
});

process.on('uncaughtException', (err) => {
  const msg = err.stack.replace(new RegExp(`${__dirname}/`, 'g'), './');
  Logger.error(`Uncaught Exception: \n ${msg}`);
  // Always best practice to let the code crash on uncaught exceptions.
  // Because you should be catching them anyway.
  process.exit(1);
});

process.on('unhandledRejection', err => {
  const msg = err.stack.replace(new RegExp(`${__dirname}/`, 'g'), './');
  Logger.error(`Unhandled Rejection: \n ${msg}`);
});

process.on('SIGINT', async () => {
  Logger.log('SIGINT signal received.');
  Logger.log('Bot shutting down...');
  await process.exit(0);
});

// <String>.toPropercase() returns a proper-cased string such as:
// "Mary had a little lamb".toProperCase() returns "Mary Had A Little Lamb"
String.prototype.toProperCase = function() {
  return this.replace(/([^\W_]+[^\s-]*) */g, function(txt) {return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

// <Array>.random() returns a single random element from an array
// [1, 2, 3, 4, 5].random() can return 1, 2, 3, 4 or 5.
Array.prototype.random = function() {
  return this[Math.floor(Math.random() * this.length)];
};

String.prototype.cleanLineBreaks = function() {
  return this.replace(/<br ?\/?>/g, '\n');
};

String.prototype.cleanDoubleQuotes = function() {
  return this.replace(/"/g, '\\"');
};

String.prototype.replaceWithBreakTags = function() {
  return this.replace(/\n/g, '<br/>');
};
