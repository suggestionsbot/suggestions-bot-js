require('dotenv-flow').config();
const fetch = require('node-fetch');

module.exports = async (client) => {

  const guildsPerShard = await client.shard.fetchClientValues('guilds.cache.size');
  const guildSizeCount = guildsPerShard.reduce((prev, count) => prev + count, 0);

  setInterval(async () => {

    const promises = [
      postTopgg,
      postBotsGG,
      postDBotList,
      postBLSpace,
      postDiscordApps,
      postBfd
    ];

    const results = await Promise.all(promises);
    client.logger.log(`Posted to ${results.length} vote sites.`);
  }, 300000);

  async function postTopgg() {
    // Discord Bots (top.gg)
    try {
      const data = { server_count: guildsPerShard };
      const body = JSON.stringify(data);

      const posted = await fetch(`https://top.gg/api/bots/${client.user.id}/stats`, {
        method: 'POST',
        headers: {
          'Authorization': process.env.TOPGGTOKEN,
          'Content-Type': 'application/json'
        },
        body: body
      });

      if (!posted.ok) throw new Error(posted.statusText);
      else client.logger.log('Server count posted to discordbots.org!');
    } catch (err) {
      return client.logger.error(`Error posting to discordbots.org: ${err.message}`);
    }
  }

  async function postBotsGG() {
    // Discord Bot List (discord.bots.gg)
    try {
      const data = {
        guildCount: guildSizeCount,
        shardCount: client.shard.count,
        shardId: client.shard.ids[0]
      };
      const body = JSON.stringify(data);

      const posted = await fetch(`https://discord.bots.gg/api/v1/bots/${client.user.id}/stats`, {
        method: 'POST',
        headers: {
          'Authorization': process.env.BOTSGG,
          'Content-Type': 'application/json'
        },
        body: body
      });

      if (!posted.ok) throw new Error(posted.statusText);
      else client.logger.log('Server count posted to discord.bots.gg!');
    } catch (err) {
      return client.logger.error(`Error posting to discord.bots.gg: ${err.message}`);
    }
  }

  async function postDBotList() {
    // Discord Bot List (discordbotlist.com)
    try {
      const data = { guilds: guildSizeCount };
      const body = JSON.stringify(data);

      const posted = await fetch(`https://discordbotlist.com/api/bots/${client.user.id}/stats`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${process.env.DBL2TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: body
      });

      if (!posted.ok) throw new Error(posted.statusText);
      else client.logger.log('Server count posted to discordbotlist.com!');
    } catch (err) {
      return client.logger.error(`Error posting to discordbotlist.com: ${err.message}`);
    }
  }

  async function postBLSpace() {
    // botlist.space
    try {
      const data = { shards: guildsPerShard };
      const body = JSON.stringify(data);

      const posted = await fetch(`https://api.botlist.space/v1/bots/${client.user.id}`, {
        method: 'POST',
        headers: {
          'Authorization': process.env.BLSTOKEN,
          'Content-type': 'application/json'
        },
        body: body
      });

      if (!posted.ok) throw new Error(posted.statusText);
      else client.logger.log('Server count posted to botlist.space!');
    } catch (err) {
      return client.logger.error(`Error posting to botlist.space: ${err.message}`);
    }
  }

  async function postDiscordApps() {
    // Discord Bot List by Terminal.ink (ls.terminal.ink)
    try {
      const data = { bot: { count: guildSizeCount } };
      const body = JSON.stringify(data);

      const posted = await fetch(`https://api.discordapps.dev/api/v2/bots/${client.user.id}`, {
        method: 'POST',
        headers: {
          'Authorization': process.env.TERMTOKEN,
          'Content-Type': 'application/json'
        },
        body: body
      });

      if (!posted.ok) throw new Error(posted.statusText);
      else client.logger.log('Server count posted to ls.terminal.ink!');
    } catch (err) {
      return client.logger.error(`Error posting to ls.terminal.ink: ${err.message}`);
    }
  }

  async function postBfd() {
    // Bots For Discord (botsfordiscord.com)
    try {
      const data = { server_count: guildSizeCount };
      const body = JSON.stringify(data);

      const posted = await fetch(`https://botsfordiscord.com/api/bot/${client.user.id}`, {
        method: 'POST',
        headers: {
          'Authorization': process.env.BFDTOKEN,
          'Content-Type': 'application/json'
        },
        body: body
      });

      if (!posted.ok) throw new Error(posted.statusText);
      else client.logger.log('Server count posted to botsfordiscord.com!');

    } catch (err) {
      return client.logger.error(`Error posting to botsfordiscord.com: ${err.message}`);
    }
  }
};
