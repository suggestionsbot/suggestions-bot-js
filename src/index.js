require('dotenv').config();
require('./utils/extensions');

const { Options, SnowflakeUtil } = require('discord.js-light');
const { ShardingManager, SharderEvents } = require('kurasuta');
const { join } = require('path');

const Logger = require('./utils/logger');

const SuggestionsClient = require('./structures/Client');
const { isProduction } = require('./config');

const channelFilter = channel => {
  return !channel.lastMessageId || SnowflakeUtil.timestampFrom(channel.lastMessageId) < Date.now() - 3600000;
};

const sharder = new ShardingManager(join(__dirname, 'structures', 'Cluster.js'), {
  clientOptions: {
    disableMentions: 'all',
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER', 'USER'],
    cacheOverwrites: true,
    cacheRoles: true,
    intents: [
      'GUILDS',
      'GUILD_MESSAGES',
      'GUILD_MESSAGE_REACTIONS',
      'DIRECT_MESSAGES',
      'DIRECT_MESSAGE_REACTIONS'
    ],
    makeCache: Options.cacheWithLimits({
      GuildManager: Infinity,
      RoleManager: Infinity,
      PermissionOverwrites: Infinity,
      ChannelManager: {
        maxSize: 0,
        sweepFilter: () => channelFilter,
        sweepInterval: 3600
      },
      GuildChannelManager: {
        maxSize: 0,
        sweepFilter: () => channelFilter,
        sweepInterval: 3600
      },
      MessageManager: {
        maxSize: 100
      }
    })
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

sharder.spawn().catch(e => Logger.error(`SHARD SPAWN: ${e}`));
