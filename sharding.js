if (Number(process.version.slice(1).split('.')[0]) < 8) throw new Error('Node 8.0.0 or higher is required. Update Node on your system.');

require('dotenv-flow').config();

const { DISCORD_TOKEN, NODE_ENV } = process.env;

const { ShardingManager } = require('discord.js');
const logger = require('./utils/logger');

const manager = new ShardingManager('./bot.js', {
  token: DISCORD_TOKEN,
  totalShards: NODE_ENV === 'production' ? 'auto' : 1,
  respawn: true,
  mode: 'process'
});

manager.spawn();
manager.on('shardCreate', shard => logger.log(`Launched shard ${shard.id}`, 'ready'));
manager.on('message', (shard, message) => {
  logger.log(`Shard[${shard.id}] : ${message._eval} : ${message._result}`);
});
