if (Number(process.version.slice(1).split('.')[0]) < 8) throw new Error('Node 8.0.0 or higher is required. Update Node on your system.');

require('dotenv').config();

const { NODE_ENV, DISCORD_TOKEN } = process.env;

const { ShardingManager, SharderEvents } = require('kurasuta');
const { join } = require('path');
const logger = require('./utils/logger');

const SuggestionsClient = require('./client/SuggestionsClient');

const sharder = new ShardingManager(join(__dirname, 'shard'), {
  clientOptions: {
    disableMentions: 'all',
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER', 'USER'],
    messageSweepInterval: 600,
    messageCacheLifetime: 300,
    messageCacheMaxSize: 0,
    cacheOverwrites: true,
    cacheRoles: true,
    ws: {
      intents: [
        'GUILDS',
        'GUILD_MESSAGES',
        'GUILD_MESSAGE_REACTIONS',
        'DIRECT_MESSAGES',
        'DIRECT_MESSAGE_REACTIONS'
      ]
    }
  },
  development: NODE_ENV !== 'production',
  client: SuggestionsClient,
  guildsPerShard: 1500,
  token: DISCORD_TOKEN,
  disabledEvents: [
    'channelCreate',
    'channelDelete',
    'channelPinsUpdate',
    'emojiCreate',
    'emojiDelete',
    'emojiUpdate',
    'guildBanAdd',
    'guildBanRemove',
    'guildMemberSpeaking',
    'inviteCreate',
    'inviteDelete',
    'presenceUpdate',
    'typingStart',
    'voiceStateUpdate',
    'webhookUpdate'
  ]
});

sharder.on(SharderEvents.MESSAGE, message => logger.log(message));

sharder.on(SharderEvents.READY, startCluster => logger.log(`Cluster ${startCluster.id} ready`));

sharder.on(SharderEvents.SPAWN, cluster => logger.log(`Cluster ${cluster.id} spawned`));

sharder.on(SharderEvents.SHARD_READY, shardID => logger.log(`Shard ${shardID} ready`));

sharder.on(SharderEvents.SHARD_RESUME, (replayed, shardID) =>
  logger.log(`Shard ${shardID} resumed connection`));

sharder.on(SharderEvents.SHARD_DISCONNECT, (closeEvent, shardID) =>
  logger.log(`Shard ${shardID} disconnected`));

sharder.on(SharderEvents.DEBUG, (message => logger.log(`SHARDER DEBUG: ${message}`)));

sharder.spawn().catch(e => logger.error(`SHARD SPAWN: ${e}`));

/* MISCELLANEOUS NON-CRITICAL FUNCTIONS */

// EXTENDING NATIVE TYPES IS BAD PRACTICE. Why? Because if JavaScript adds this
// later, this conflicts with native code. Also, if some other lib you use does
// // this, a conflict also occurs. KNOWING THIS however, the following methods
// // are, we feel, very useful in code.

// These 2 process methods will catch exceptions and give *more details* about the error and stack trace.
process.on('uncaughtException', (err) => {
  const msg = err.stack.replace(new RegExp(`${__dirname}/`, 'g'), './');
  logger.error(`Uncaught Exception: \n ${msg}`);
  // Always best practice to let the code crash on uncaught exceptions.
  // Because you should be catching them anyway.
  process.exit(1);
});

process.on('unhandledRejection', err => {
  const msg = err.stack.replace(new RegExp(`${__dirname}/`, 'g'), './');
  logger.error(`Unhandled Rejection: \n ${msg}`);
});

process.on('SIGINT', async () => {
  logger.log('SIGINT signal received.');
  logger.log('Bot shutting down...');
  await sharder.client.mongoose.close();
  await sharder.client.destroy();
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
