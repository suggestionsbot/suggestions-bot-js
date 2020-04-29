if (Number(process.version.slice(1).split('.')[0]) < 8) throw new Error('Node 8.0.0 or higher is required. Update Node on your system.');

require('dotenv-flow').config();

const { ShardingManager } = require('discord.js');
const logger = require('./utils/logger');

const manager = new ShardingManager('./bot.js', {
  token: process.env.CLIENT_TOKEN,
  totalShards: 'auto',
  respawn: true
});

manager.spawn();
manager.on('launch', shard => logger.log(`Launched shard ${shard.id}`, 'ready'));
manager.on('message', (shard, message) => {
  logger.log(`Shard[${shard.id}] : ${message._eval} : ${message._result}`);
});
