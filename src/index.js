require('dotenv').config();
require('./utils/extensions');

const { ShardingManager, SharderEvents } = require('kurasuta');
const { isMaster } = require('cluster');
const { join } = require('path');
const Logger = require('./utils/logger');

const SuggestionsClient = require('./structures/Client');
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
  // clusterCount: 4,
  // shardCount: 4
});

sharder.on(SharderEvents.MESSAGE, message => {
  Logger.log(message);

  // if (isMaster && (message['name'] === 'shardStats')) dummyFunc(message.data);
});

sharder.on(SharderEvents.READY, startCluster => Logger.ready(`Cluster ${startCluster.id} ready`));

sharder.on(SharderEvents.SPAWN, cluster => Logger.log(`Cluster ${cluster.id} spawned`));

sharder.on(SharderEvents.SHARD_READY, shardID => Logger.ready(`Shard ${shardID} ready`));

sharder.on(SharderEvents.SHARD_RESUME, (replayed, shardID) =>
  Logger.log(`Shard ${shardID} resumed connection`));

sharder.on(SharderEvents.SHARD_DISCONNECT, (closeEvent, shardID) =>
  Logger.warning('SHARD DISCONNECT', `Shard ${shardID} disconnected`));

if (!isProduction() && process.env.DEBUG)
  sharder.on(SharderEvents.DEBUG, (message => Logger.debug(`SHARDER DEBUG: ${message}`)));

sharder.spawn().catch(e => Logger.error(`SHARD SPAWN: ${e}`));

const dummyFunc = ({ clusterId, guildCount }) => {
  Logger.log(`[ CLUSTER ${clusterId} ] The bot is in ${guildCount} guilds!`);
};
