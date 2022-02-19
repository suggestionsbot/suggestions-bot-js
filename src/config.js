const isProduction = () => process.env.NODE_ENV === 'production';

module.exports = {
  isProduction,
  prefix: ',',
  suggestionsChannel: 'suggestions',
  suggestionsLogs: 'suggestion-logs',
  serverLogs: isProduction() ? '602332466476482616' : '498627833233539086',
  owners: ['158063324699951104'],
  embedColor: 0xffd663,
  colors: {
    main: 0xffd663,
    error: 0xd63031,
    suggestion: {
      approved: 0x00e640,
      rejected: 0xcf000f
    },
    guild: {
      created: 0x2ecc71,
      deleted: 0xff4500
    },
    blacklist: {
      add: 0x00e640,
      remove: 0xd64541
    }
  },
  discord: 'https://discord.gg/suggestions',
  website: 'https://suggestionsbot.com',
  docs: 'https://docs.suggestionsbot.com',
  github: 'https://github.com/suggestionsbot/suggestions-bot',
  hastebin: 'https://paste.nerdcave.dev',
  invite: isProduction() ? 'https://suggestions.bot/invite' : 'https://discord.com/oauth2/authorize?client_id=771924181784854579&scope=bot&permissions=355392',
  voteSites: [
    { name: 'top.gg', link: 'https://top.gg/bot/474051954998509571', voting: true },
    { name: 'discord.bots.gg', link: 'https://discord.bots.gg/bots/474051954998509571', voting: false },
    { name: 'discordbotlist.com', link: 'https://discordbotlist.com/bots/474051954998509571', voting: true },
    { name: 'botlist.space', link: 'https://botlist.space/bot/474051954998509571', voting: true },
    { name: 'botsforddiscord.com', link: 'https://botsfordiscord.com/bots/474051954998509571', voting: true }
  ],
  superSecretUsers: [
    '214719690855940109', // Lukasz
    '245385436669804547', // Kyle
    '158063324699951104' // Anthony
  ],
  defaultSettings: {
    prefix: ',',
    suggestionsChannel: 'suggestions',
    suggestionsLogs: 'suggestion-logs',
    staffRoles: [],
    disabledCommands: [],
    responseRequired: false,
    dmResponses: true,
    fetchedMessages: false
  },
  emojis: {
    success: isProduction() ? '605265580416565269' : '578409088157876255'
  },
  defaultPermissions: 355392,
  logsPermissions: 84992,
  staffChannelPermissions: 85056,
  // Developer, Leadership, Moderators, Trusted
  supportRoles: isProduction() ?
    ['601235098012090378', '603803993562677258', '601235098502823947', '629883041946533893'] :
    ['792914393108054066', '782810845444964383', '485987998794514442', '776576870245597255'],
  timers: {
    stats: '*/30 * * * *'
  }
};
