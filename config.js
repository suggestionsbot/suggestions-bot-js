require('dotenv-flow').config();
const isProduction = () => process.env.NODE_ENV === 'production';

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
    isProduction() ? '474051954998509571' : '771924181784854579'
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
    success: isProduction() ? '605265580416565269' : '578409088157876255'
  },
  defaultPermissions: 355392,
  logsPermissions: 84992,
  staffChannelPermissions: 85056,
  // Leadership, Moderators, Trusted
  supportRoles: isProduction() ?
    ['603803993562677258', '601235098502823947', '629883041946533893'] :
    ['782810845444964383', '485987998794514442', '776576870245597255']
};
