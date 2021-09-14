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
