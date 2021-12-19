require('dotenv').config();
require('./utils/extensions');

const { ShardingManager, SharderEvents } = require('kurasuta');
const { join } = require('path');
const logger = require('./utils/logger');

const SuggestionsClient = require('./structures/SuggestionsClient');
const { isProduction } = require('./config');

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

sharder.on(SharderEvents.MESSAGE, message => logger.log(message));

sharder.on(SharderEvents.READY, startCluster => logger.log(`Cluster ${startCluster.id} ready`));

sharder.on(SharderEvents.SPAWN, cluster => logger.log(`Cluster ${cluster.id} spawned`));

sharder.on(SharderEvents.SHARD_READY, shardID => logger.log(`Shard ${shardID} ready`));

sharder.on(SharderEvents.SHARD_RESUME, (replayed, shardID) =>
  logger.log(`Shard ${shardID} resumed connection`));

sharder.on(SharderEvents.SHARD_DISCONNECT, (closeEvent, shardID) =>
  logger.log(`Shard ${shardID} disconnected`));

if (!isProduction() && process.env.DEBUG)
  sharder.on(SharderEvents.DEBUG, (message => logger.log(`SHARDER DEBUG: ${message}`)));

sharder.spawn().catch(e => logger.error(`SHARD SPAWN: ${e}`));
