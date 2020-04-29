if (Number(process.version.slice(1).split('.')[0]) < 8) throw new Error('Node 8.0.0 or higher is required. Update Node on your system.');

const { ShardingManager } = require('kurasuta');
const { SuggestionsClient } = require('./client/SuggestionsClient');
const { join } = require('path');

require('dotenv-flow').config();
// const logger = require('./utils/logger');
// const { ShardingManager } = require('discord.js');
// const manager = new ShardingManager('./bot.js', {
//   token: process.env.CLIENT_TOKEN,
//   totalShards: 'auto',
//   respawn: true
// });

// manager.spawn();
// manager.on('launch', shard => logger.log(`Launched shard ${shard.id}`, 'ready'));
// manager.on('message', (shard, message) => {
//   logger.log(`Shard[${shard.id}] : ${message._eval} : ${message._result}`);
// });

const sharder = new ShardingManager(join(__dirname, 'bot'), {
  token: process.env.CLIENT_TOKEN,
  development: process.env.NODE_ENV === 'development' ? true : false,
  client: SuggestionsClient,
  clientOptions: {
    disableEveryone: true
  },
  clusterCount: 'auto',
  shardCount: 'auto',
  respawn: true
});

sharder.on('ready', cluster => console.log(`Cluster ${cluster.id} is ready.`));
sharder.on('shardReady', shardID => console.log(`Shard ${shardID} is ready.`));
sharder.on('spawn', cluster => console.log(`Cluster ${cluster.id} spawned.`));
sharder.on('error', message => console.error(message));

sharder.spawn();
