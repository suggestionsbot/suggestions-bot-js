require('dotenv-flow').config();

module.exports = {
    botLists: {
        dblToken: process.env.DBLTOKEN,
        botsggToken: process.env.BOTSGG,
        dbl2Token: process.env.DBL2TOKEN,
        ddbToken: process.env.DDBTOKEN,
        blsToken: process.env.BLSTOKEN,
        termToken: process.env.TERMTOKEN,
        bfdToken: process.env.BFDTOKEN
    },
    db : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        name: process.env.DB_NAME
    },
    prefix: process.env.PREFIX,
    suggestionsChannel: process.env.SUGGESTIONSCHANNEL,
    suggestionsLogs: process.env.SUGGESTIONSLOGS,
    owner: process.env.OWNER,
    embedColor: process.env.DEFAULT_COLOR,
    discord: process.env.DISCORD,
    docs: process.env.DOCS,
    invite: process.env.INVITE,
    suggestionColors: {
        approved: '#00e640',
        rejected: '#cf000f'
    },
    voteSites: [
        { name: 'Discord Bot List (DiscordBots.org)', link: 'https://discordbots.org/bot/474051954998509571' },
        { name: 'Discord Bots', link: 'https://discord.bots.gg/bots/474051954998509571' },
        { name: 'Discord Bot List (DiscordBotList.com)', link: 'https://discordbotlist.com/bots/474051954998509571' },
        { name: 'Divine Discord Bot List', link: 'https://divinediscordbots.com/bots/474051954998509571' },
        { name: 'botlist.space', link: 'https://botlist.space/bot/474051954998509571' },
        { name: 'Discord Bot List by Terminal.ink', link: 'https://ls.terminal.ink/bots/474051954998509571', },
        { name: 'Bots For Discord', link: 'https://botsfordiscord.com/bots/474051954998509571' }
    ],
    patreon: process.env.PATREON,
    defaultSettings: {
        prefix: this.prefix,
        suggestionsChannel: this.suggestionsChannel,
        suggestionsLogs: this.suggestionsLogs
    }
};