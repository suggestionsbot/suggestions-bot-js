const fetch = require('node-fetch');

module.exports = async (client) => {

  const tokens = client.config.botLists;

  const guildsPerShard = await client.shard.fetchClientValues('guilds.size');
  const guildSizeCount = guildsPerShard.reduce((prev, count) => prev + count, 0);
  // guildSize = guildSize.reduce((prev, count) => prev + count, 0);

  setInterval(() => {
    postDBorg();
    postBotsGG();
    postDBotList();
    postDivine();
    postBLSpace();
    postTerminal();
    postBfd();
  }, 300000);

  async function postDBorg() {
    // Discord Bots (discordbots.org)
    try {
      // let data = { server_count: client.guilds.size };
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
      // let data = { guildCount: client.guilds.size };
      const data = {
        guildCount: guildSizeCount,
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
      // let data = { guilds: client.guilds.size };
      const data = {
        guilds: guildSizeCount,
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
    // let data = { server_count: client.guilds.size };
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
      // let data = { server_count: client.guilds.size };
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

  async function postTerminal() {
    // Discord Bot List by Terminal.ink (ls.terminal.ink)
    try {
      // let data = { bot: { count: client.guilds.size }};
      const data = { bot: { count: guildSizeCount } };
      const body = JSON.stringify(data);

      const posted = await fetch(`https://ls.terminal.ink/api/v2/bots/${client.user.id}`, {
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
      // let data = { server_count: client.guilds.size };
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
