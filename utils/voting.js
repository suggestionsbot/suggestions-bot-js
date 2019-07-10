const fetch = require('node-fetch');

module.exports = async (client) => {

  const tokens = client.config.botLists;

  const guildsPerShard = await client.shard.fetchClientValues('guilds.size');
  const guildSizeCount = guildsPerShard.reduce((prev, count) => prev + count, 0);
  // guildSize = guildSize.reduce((prev, count) => prev + count, 0);

  setInterval(async () => {
    // postDBorg();
    // postBotsGG();
    // postDBotList();
    // postDivine();
    // postBLSpace();
    // postDiscordApps();
    // postBfd();

    const promises = [
      postDBorg,
      postBotsGG,
      postDBotList,
      postDivine,
      postBLSpace,
      postDiscordApps,
      postBfd
    ];

    const results = await Promise.all(promises);
    client.logger.log(`Posted to ${results.length} vote sites.`);
  }, 300000);

  async function postDBorg() {
    // Discord Bots (discordbots.org)
    try {
      const data = {
        shards: guildsPerShard,
        shard_id: client.shard.id,
        shard_count: client.shard.count
      };
      const body = JSON.stringify(data);

      const posted = await fetch(`https://discordbots.org/api/bots/${client.user.id}/stats`, {
        method: 'POST',
        headers: {
          'Authorization': tokens.dblToken,
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
        guildCount: guildsPerShard,
        shardCount: client.shard.count,
        shardId: client.shard.id
      };
      const body = JSON.stringify(data);

      const posted = await fetch(`https://discord.bots.gg/api/v1/bots/${client.user.id}/stats`, {
        method: 'POST',
        headers: {
          'Authorization': tokens.botsggToken,
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
      const data = {
        guilds: guildsPerShard,
        shard_id: client.shard.id
      };
      const body = JSON.stringify(data);

      const posted = await fetch(`https://discordbotlist.com/api/bots/${client.user.id}/stats`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${tokens.dbl2Token}`,
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

  async function postDivine() {
    // Divine Discord Bot List (divinediscordbots.com)
    const data = { server_count : guildSizeCount };
    const body = JSON.stringify(data);

    try {
      const posted = await fetch(`https://divinediscordbots.com/bot/${client.user.id}/stats`, {
        method: 'POST',
        headers: {
          'Authorization': tokens.ddbToken,
          'Content-Type': 'application/json'
        },
        body: body
      });

      if (!posted.ok) throw new Error(posted.statusText);
      else client.logger.log('Server count posted to divinediscordbots.com!');
    } catch (err) {
      return client.logger.error(`Error posting to divinediscordbots.com: ${err.message}`);
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
          'Authorization': tokens.blsToken,
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
          'Authorization': tokens.termToken,
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
          'Authorization': tokens.bfdToken,
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
