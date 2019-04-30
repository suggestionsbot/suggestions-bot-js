require('dotenv-flow').config();
const logger = require('./utils/logger');
const { ShardingManager } = require('discord.js');
const manager = new ShardingManager('./bot.js', {
  token: process.env.CLIENT_TOKEN,
  autoSpawn: true
});

manager.spawn();
manager.on('launch', shard => logger.log(`Launched shard ${shard.id}`, 'ready'));
manager.on('message', (shard, message) => {
  logger.log(`Shard[${shard.id}] : ${message._eval} : ${message._result}`);
});
