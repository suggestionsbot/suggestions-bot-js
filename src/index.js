require('dotenv').config();
require('./utils/extensions');

const { ShardingManager, SharderEvents } = require('kurasuta');
const { join } = require('path');
const { hostname } = require('os');
const { init, configureScope, Integrations } = require('@sentry/node');
const { RewriteFrames } = require('@sentry/integrations');

const Logger = require('./utils/logger');
const pkg = require('../package.json');
const { lastCommitHash, reportToSentry } = require('./utils/functions');

const SuggestionsClient = require('./structures/Client');
const { isProduction } = require('./config');

if (!process.env.SENTRY_DSN)
  Logger.warning('SENTRY_DSN', 'The "SENTRY_DSN" environment variable is missing. It\'s optional, but recommended!');
else {
  Logger.log('Initializing Sentry...');
  const environment = process.env.NODE_ENV ?? 'development';

  init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACERATE),
    release: pkg.version,
    environment,
    serverName: hostname(),
    integrations: [
      new RewriteFrames({ root: __dirname || process.cwd() }),
      new Integrations.Http({ tracing: true })
    ]
  });

  configureScope(scope => {
    scope.setTags({
      'suggestions.environment': environment,
      'suggestions.version': pkg.version,
      'suggestions.commit': lastCommitHash(),
      'system.user': require('os').userInfo().username,
      'system.os': process.platform
    });
  });

  Logger.ready('Sentry successfully initialized. Now starting the bot...');
}

const sharder = new ShardingManager(join(__dirname, 'structures', 'Cluster.js'), {
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
  development: process.env.DEBUG,
  client: SuggestionsClient,
  guildsPerShard: 1500,
  token: process.env.DISCORD_TOKEN,
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

sharder.on(SharderEvents.MESSAGE, message => Logger.log(message));

sharder.on(SharderEvents.READY, startCluster => Logger.ready(`Cluster ${startCluster.id} ready`));

sharder.on(SharderEvents.SPAWN, cluster => Logger.log(`Cluster ${cluster.id} spawned`));

sharder.on(SharderEvents.SHARD_READY, shardID => Logger.ready(`Shard ${shardID} ready`));

sharder.on(SharderEvents.SHARD_RESUME, (replayed, shardID) =>
  Logger.log(`Shard ${shardID} resumed connection`));

sharder.on(SharderEvents.SHARD_DISCONNECT, (closeEvent, shardID) =>
  Logger.warning('SHARD DISCONNECT', `Shard ${shardID} disconnected`));

if (!isProduction() && process.env.DEBUG)
  sharder.on(SharderEvents.DEBUG, (message => Logger.debug(`SHARDER DEBUG: ${message}`)));

sharder.spawn().catch(e => {
  Logger.error(`SHARD SPAWN: ${e}`);
  reportToSentry(e);
});
