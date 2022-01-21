const fs = require('fs');
const path = require('path');
const petitio = require('petitio');
const { CronJob } = require('cron');
const { Client, MessageMentions, Message, Guild, Channel } = require('discord.js-light');

const config = require('../config');
const Logger = require('./logger');

/**
 * Validate if a string input is a snowflake or not
 * Source: https://github.com/tandpfun/DiscordTools/blob/f452733ba2984a5b87493fb1dc7a8b80612a0760/pages/snowflake.vue#L209-L219
 * @param snowflake - The snowflake to validate.
 * @returns {Boolean} If the snowflake is valid or not.
 */
const validateSnowflake = (snowflake) => {
  const epoch = 1420070400000;

  if (!snowflake) return false;
  if (isNaN(snowflake)) return false;
  if (snowflake < 4194304) return false;

  const timestamp = new Date(snowflake / (4194304 + epoch));
  return !isNaN(timestamp.getTime());
};

/**
 * Validate if provided input resolves to a valid TextChannel
 * @param {GuildChannelManager|ChannelManager} manager
 * @param {String} str
 * @return {Promise<TextChannel|null>}
 */
const validateChannel = (manager, str) => {
  return manager.forge(str).fetch().catch(() => null);
};

/**
 * "Walk" through directories to get all files of a particular extension.
 * @param {String} directory The directory to "walk" through
 * @param {String[]} extensions An array of file extensions to search by
 * @return {*[]}
 */
const walk = (directory, extensions) => {
  const read = (dir, files = []) => {
    for (const file of fs.readdirSync(dir)) {
      const filePath = path.join(dir, file), stats = fs.lstatSync(filePath);
      if (stats.isFile() && extensions.some(ext => filePath.endsWith(ext))) files.push(filePath);
      else if (stats.isDirectory()) files = files.concat(read(filePath));
    }

    return files;
  };

  return read(directory);
};

/**
 * Display a user-friendly timestamp in the Discord client.
 * @param {Number|Date} dateType The timestamp or Date object
 * @param {'t', 'T', 'd', 'D', 'f', 'F', 'R'?} type The type of timestamp to display (ex. relative)
 * @return {String} The timestamp style
 */
const displayTimestamp = (dateType, type) => {
  const timestamp = typeof dateType === 'object' ? new Date(dateType).getTime() : dateType;

  const validOptions = ['t', 'T', 'd', 'D', 'f', 'F', 'R'];
  if (type && !validOptions.includes(type)) type = 'f';

  return `<t:${Math.floor(timestamp / 1000)}${type ? `:${type}` : ''}>`;
};

/**
 * Display a user-friendly uptime in days, hours, minutes and seconds.
 * Source: https://guwii.com/bytes/count-date-time-javascript/
 * @param {Number} uptime The number of milliseconds
 * @return {String} The uptime
 */
const displayUptime = (uptime) => {
  const secondsInADay = 60 * 60 * 1000 * 24;
  const secondsInAHour = 60 * 60 * 1000;

  const days = Math.floor(uptime / secondsInADay);
  const hours = Math.floor((uptime % secondsInADay) / secondsInAHour);
  const minutes = Math.floor(((uptime % secondsInADay) % secondsInAHour) / (60 * 1000));
  const seconds = Math.floor((uptime % (1000 * 60)) / 1000);

  const mapped = {
    s: 'secs',
    m: 'mins',
    h: 'hrs',
    d: 'days'
  };

  return [
    { type: 'd', value: days },
    { type: 'h', value: hours },
    { type: 'm', value: minutes },
    { type: 's', value: seconds }
  ].filter(x => x.value > 0).map(x => `${x.value} ${mapped[x.type]}`).join(', ');
};

/**
 * Get a random GIF from the Giphy API via a tag.
 * @param {String} tag The tag to filter results by
 * @return {Promise<String>} The static image URL of the GIF.
 */
const getRandomGiphyImage = (tag) => {
  return petitio('https://api.giphy.com/v1/gifs/random')
    .query('api_key', process.env.GIPHY)
    .query('tag', tag)
    .json()
    .then(({ data }) => data.images.original.url);
};

/**
 * Returns the default suggestions channel if it exists in the server.
 * @param {Guild} guild The guild to check.
 * @return {Promise<TextChannel>|null} Return the channel, if it exists
 */
const getDefaultSuggestionsChannel = (guild) => {
  return guild.channels.fetch().then(res => res.find(c => c.name === config.suggestionsChannel)) ?? null;
};

/**
 * Return a new array of parsed array of arguments removing brackets.
 * @param {Array<String>} args The command arguments.
 * @return {Array<String>} Return the new array of arguments.
 */
const parseCommandArguments = (args) => {
  const toParseRegex = /[<>[\]]/gm;

  const discordPatterns = [
    MessageMentions.CHANNELS_PATTERN,
    MessageMentions.EVERYONE_PATTERN,
    MessageMentions.ROLES_PATTERN,
    MessageMentions.USERS_PATTERN,
    // emoji pattern
    /<?(?:(a):)?(\w{2,32}):(\d{17,19})?>?/
  ];

  // This functionality could likely be improved. Feel free to open an issue or PR.
  if (args.length <= 3) {
    return args.map(x => {
      const isMatch = discordPatterns.some(r => RegExp(r, 'g').test(x));
      if (!isMatch) return x.replace(toParseRegex, '');
      return x;
    });
  } else {
    const len = args.join(' ').length;
    return args.join(' ').split('').map((x, i) => {
      if (i === 0) x = x.replace(/[<[]/gm, '');
      if (i === len - 1) x = x.replace(/[>\]]/gm, '');
      return x;
    }).join('').trim().split(/ +/g);
  }
};

/**
 * Post bot stats to the voting/stats API.
 * @param {Client} client The client to post the stats from..
 * @return {Promise<Boolean>} If the request succeeded or not.
 */
const postStats = async (client) => {
  const time = Date.now();
  const now = Math.floor(time / 1000);
  const guildCount = await client.shard.fetchClientValues('guilds.cache.size')
    .then(res => res.reduce((a, b) => a + b, 0));

  const data = { 'guild_count': guildCount, timestamp: now };

  return petitio(process.env.STATS_API_URL, 'POST')
    .header('Authorization', `Bearer ${process.env.STATS_API_KEY}`)
    .body(data)
    .json()
    .then(body => !!body.success);
};

/**
 * Create the CronJob for posting stats to the voting/stats API.
 * @param {Client} client The Discord client to associate with the CronJob.
 * @return {CronJob} The new CronJob.
 */
const postStatsCronJob = (client) => {
  Logger.log('Running cron job for posting bot stats...');
  return new CronJob(config.timers.stats, async () => {
    try {
      const success = await postStats(client);
      Logger.log(`${success ? 'S' : 'Uns'}uccessfully posted stats to the API!`);
    } catch (e) {
      return Logger.error('STATS JOB', e);
    }
  }, null, true, 'America/New_York');
};

/**
 * Deletes a message according to a specified timeout.
 * @param {Message} message The message to delete, represented as an object.
 * @param {Number} timeout The timeout, in milliseconds.
 * @return {Promise<Message>} The deleted message.
 */
const messageDelete = (message, timeout) => {
  return new Promise((resolve, reject) => {
    const tm = setTimeout(() => {
      message.delete().then(resolve).catch(err => {
        clearTimeout(tm);
        reject(err);
      });
    }, timeout);

    return tm;
  });
};

/**
 * Forcefully sets the provided channel ID in the cache.
 * @param {Client} client The client.
 * @param {String} channelId The channel ID.
 * @param {Guild?} guild The guild, if provided.
 * @return {Promise<Channel>} The channel set into the cache.
 */
const cacheChannel = async (client, channelId, guild) => {
  const channel = await client.channels.fetch(channelId);
  client.channels.cache.forceSet(channel.id, channel);
  if (guild) guild.channels.cache.forceSet(channel.id, channel);
  return channel;
};

/**
 * Get a channel from either the cache or REST API (and cache it)..
 * @param {Client} client The client.
 * @param {String} channelId The channel ID.
 * @param {Guild?} guild The guild, if provided.
 * @return {Promise<Channel>} The channel from the cache..
 */
const getChannelAndCache = async (client, channelId, guild) => {
  return client.channels.cache.has(channelId)
    ? client.channels.cache.get(channelId)
    : await cacheChannel(client, channelId, guild);
};

module.exports = {
  validateSnowflake,
  validateChannel,
  walk,
  displayTimestamp,
  displayUptime,
  getRandomGiphyImage,
  getDefaultSuggestionsChannel,
  parseCommandArguments,
  postStatsCronJob,
  messageDelete,
  cacheChannel,
  getChannelAndCache
};
