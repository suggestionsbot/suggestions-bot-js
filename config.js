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
  website: process.env.WEBSITE,
  docs: process.env.DOCS,
  invite: process.env.INVITE,
  giphyKey: process.env.GIPHY,
  suggestionColors: {
    approved: '#00e640',
    rejected: '#cf000f'
  },
  guildStatusColors: {
    created: '#2ecc71',
    deleted: '#FF4500'
  },
  voteSites: [
    { name: 'Discord Bot List (DiscordBots.org)', link: 'https://discordbots.org/bot/474051954998509571', voting: true },
    { name: 'Discord Bots', link: 'https://discord.bots.gg/bots/474051954998509571', voting: false },
    { name: 'Discord Bot List (DiscordBotList.com)', link: 'https://discordbotlist.com/bots/474051954998509571', voting: true },
    { name: 'Divine Discord Bot List', link: 'https://divinediscordbots.com/bots/474051954998509571', voting: true },
    { name: 'botlist.space', link: 'https://botlist.space/bot/474051954998509571', voting: true },
    { name: 'Discord Apps', link: 'https://discordapps.dev/en-GB/bots/474051954998509571', voting: true },
    { name: 'Bots For Discord', link: 'https://botsfordiscord.com/bots/474051954998509571', voting: true }
  ],
  patreon: process.env.PATREON,
  superSecretUsers: [
    '214719690855940109', // Lukasz
    '245385436669804547', // Kyle
    '158063324699951104' // Anthony
  ],
  defaultSettings: {
    prefix: process.env.PREFIX,
    suggestionsChannel: process.env.SUGGESTIONSCHANNEL,
    suggestionsLogs: process.env.SUGGESTIONSLOGS
  },
  emojis: {
    success: '578409088157876255'
  }
};
