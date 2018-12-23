const fetch = require('node-fetch');
const DBL = require('dblapi.js');

module.exports = async (client) => {

    const tokens = client.config.botLists;

    setInterval(voteUtils, 180000);

    async function voteUtils() {
        // Discord Bots (discordbots.org)
        const dbl = new DBL(tokens.dblToken, client, {
            statsInterval: 0
        });

        dbl.on('posted', () => {
            client.logger.log('Server count posted to DiscordBots.org!');
        });

        dbl.on('error', e => {
            client.logger.error(e);
        });

        // Discord Bot List (discord.bots.gg)
        try {
            let data = {
                guildCount: client.guilds.size
            };
            let posted = await fetch(`https://discord.bots.gg/api/v1/bots/474051954998509571/stats`, {
                method: 'POST',
                headers: {
                    'Authorization': tokens.botsggToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!posted.ok) throw new Error(posted.statusText);
            else client.logger.log('Server count posted to discord.bots.gg!');
        } catch (err) {
            return client.logger.error(`Error posting to discord.bots.gg: ${err.message}`);
        }

        // Discord Bot List (discordbotlist.com)
        try {
            let data = {
                guilds: client.guilds.size
            };
            let posted = await fetch(`https://discordbotlist.com/api/bots/${client.user.id}/stats`, {
                method: 'POST',
                headers: {
                    'Authorization': tokens.dbl2Token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!posted.ok) throw new Error(posted.statusText);
            else client.logger.log('Server count posted to discordbotlist.com!');
        } catch (err) {
            return client.logger.error(`Error posting to discordbotlist.com: ${err.message}`);
        }

        // Divine Discord Bot List (divinediscordbots.com)
        let data = {
            server_count: client.guilds.size
        };
        try {
            let posted = await fetch(`https://divinediscordbots.com/api/bots/${client.user.id}/stats`, {
                method: 'POST',
                headers: {
                    'Authorization': tokens.ddbToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!posted.ok) throw new Error(posted.statusText);
            else client.logger.log('Server count posted to divinediscordbots.com!');
        } catch (err) {
            return client.logger.error(`Error posting to divinediscordbots.com: ${err.message}`);
        }

        // botlist.space
        try {
            let data = {
                server_count: client.guilds.size
            };
            let posted = await fetch(`https://botlist.space/api/bots/${client.user.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': tokens.blsToken,
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!posted.ok) throw new Error(posted.statusText);
            else client.logger.log('Server count posted to botlist.space!');
        } catch (err) {
            return client.logger.error(`Error posting to botlist.space: ${err.message}`);
        }

        // Discord Bot List by Terminal.ink (ls.terminal.ink)
        try {
            let data = {};
            let posted = await fetch(`https://ls.terminal.ink/api/v2/bots/${client.user.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': tokens.termToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!posted.ok) throw new Error(posted.statusText);
            else client.logger.log('Server count posted to ls.terminal.ink!');
        } catch (err) {
            return client.logger.error(`Error posting to ls.terminal.ink: ${err.message}`);
        }

        // Bots For Discord (botsfordiscord.com)
        try {
            let data = {
                server_count: client.guilds.size
            };
            let posted = await fetch(`https://botsfordiscord.com/api/bot/${client.user.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': tokens.bfdToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!posted.ok) throw new Error(posted.statusText);
            else client.logger.log('Server count posted to botsfordiscord.com!');

        } catch (err) {
            return client.logger.error(`Error posting to botsfordiscord.com: ${err.message}`);
        }
    }
};
