const fs = require('fs');
const path = require('path');
const petitio = require('petitio');

/**
 * Validate if a string input is a snowflake or not
 * Source: https://github.com/tandpfun/DiscordTools/blob/f452733ba2984a5b87493fb1dc7a8b80612a0760/pages/snowflake.vue#L209-L219
 * @param snowflake - The snowflake to validate.
 * @returns {Boolean} If the snowflake is valid or not.
 */
exports.validateSnowflake = (snowflake) => {
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
exports.validateChannel = (manager, str) => {
  return manager.forge(str).fetch({ cache: false }).catch(() => null);
};

/**
 * "Walk" through directories to get all files of a particular extension.
 * @param {String} directory The directory to "walk" through
 * @param {String[]} extensions An array of file extensions to search by
 * @return {*[]}
 */
exports.walk = (directory, extensions) => {
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
exports.displayTimestamp = (dateType, type) => {
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
exports.displayUptime = (uptime) => {
  const secondsInADay = 60 * 60 * 1000 * 24;
  const secondsInAHour = 60 * 60 * 1000;

  const days = Math.floor(uptime / (secondsInADay));
  const hours = Math.floor((uptime % (secondsInADay)) / (secondsInAHour));
  const minutes = Math.floor(((uptime % (secondsInADay)) % (secondsInAHour)) / (60 * 1000));
  const seconds = Math.floor(((((uptime % (secondsInADay)) % (secondsInAHour)) % (60 * 1000)) / 1000));

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

exports.getRandomGiphyImage = (query) => {
  return petitio('https://api.giphy.com/v1/gifs/random')
    .query('api_key', process.env.GIPHY)
    .query('tag', query)
    .json()
    .then(({ data }) => data.images.original.url);
};
