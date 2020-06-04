require('dotenv-flow').config();

module.exports = {
  prefix: ',',
  suggestionsChannel: 'suggestions',
  suggestionsLogs: 'suggestion-logs',
  owners: ['158063324699951104'],
  embedColor: 0xdd9323,
  discord: 'https://discord.gg/ntXkRan',
  website: 'https://suggestionsbot.com',
  docs: 'https://docs.suggestionsbot.com',
  invite: `https://discord.com/oauth2/authorize?client_id=${
    process.env.NODE_ENV === 'production' ? '474051954998509571' : '476928510573805568'
  }&scope=bot&permissions=355392`,
  suggestionColors: {
    approved: '#00e640',
    rejected: '#cf000f'
  },
  guildStatusColors: {
    created: '#2ecc71',
    deleted: '#FF4500'
  },
  voteSites: [
    { name: 'top.gg', link: 'https://top.gg/bot/474051954998509571', voting: true },
    { name: 'discord.bots.gg', link: 'https://discord.bots.gg/bots/474051954998509571', voting: false },
    { name: 'discordbotlist.com', link: 'https://discordbotlist.com/bots/474051954998509571', voting: true },
    { name: 'botlist.space', link: 'https://botlist.space/bot/474051954998509571', voting: true },
    { name: 'discordapps.dev', link: 'https://discordapps.dev/en-GB/bots/474051954998509571', voting: true },
    { name: 'botsforddiscord.com', link: 'https://botsfordiscord.com/bots/474051954998509571', voting: true }
  ],
  patreon: 'https://www.patreon.com/acollierr17',
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
    success: '578409088157876255'
  },
};
