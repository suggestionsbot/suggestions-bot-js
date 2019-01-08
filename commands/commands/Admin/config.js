const { stripIndents } = require('common-tags');
const Command = require('../../Command');

const emojiSets = {
    defaultEmojis: 'Defaults',
    oldDefaults: 'Old Defaults',
    thumbsEmojis: 'Thumbs',
    arrowsEmojis: 'Arrows',
    christmasEmojis: 'Christmas',
    jingleBellsEmojis: 'Bells'
};

const responses = {
    true: 'True',
    false: 'False'
};

module.exports = class ConfigCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'config',
            category: 'Admin',
            description: 'View a text-based version of the bot configuration for the guild.',
            aliases: ['conf', 'viewconf', 'viewconfig', 'settings'],
            adminOnly: true,
            botPermissions: ['MANAGE_MESSAGES']
        });
    }

    async run(message, args) {
        
        await message.delete().catch(O_o=>{});

        let gSettings = {};
        let gBlacklists = {};
        let gSuggestions = {};

        try {
            gSettings = await this.client.settings.getSettings(message.guild);
            gBlacklists = await this.client.blacklists.getGuildBlacklist(message.guild);
            gSuggestions = await this.client.suggestions.getGuildSuggestions(message.guild);
        } catch (err) {
            this.client.logger.error(err.stack);
            return message.channel.send(err.message);
        }

        let {
            guildID,
            guildName,
            guildOwnerID,
            prefix,
            suggestionsChannel,
            suggestionsLogs,
            staffSuggestionsChannel,
            staffRoles,
            voteEmojis,
            responseRequired
        } = gSettings;

        const guildOwner = message.guild.members.get(guildOwnerID);
        
        let roles = [];
        try {
            roles = message.guild.roles.filter(role => staffRoles.map(role => role.role).includes(role.id));
            suggestionsChannel = message.guild.channels.find(c => c.name === suggestionsChannel) || (message.guild.channels.find(c => c.toString() === suggestionsChannel)) || (message.guild.channels.get(suggestionsChannel)) || '';
            suggestionsLogs = message.guild.channels.find(c => c.name === suggestionsLogs) || message.guild.channels.find(c => c.toString() === suggestionsLogs) || message.guild.channels.get(suggestionsLogs) || '';
            staffSuggestionsChannel = message.guild.channels.find(c => c.name === staffSuggestionsChannel) || (message.guild.channels.find(c => c.toString() === staffSuggestionsChannel)) || (message.guild.channels.find(c => c.id === staffSuggestionsChannel)) || '';
        } catch (err) {
            this.client.logger.error(err.stack);
            return message.channel.send(err.message);
        }

        let config = stripIndents`
        • Guild Name: ${guildName} (${guildID})
        • Guild Owner: ${guildOwner.user.tag} (${guildOwner.id})
        • Prefix: ${prefix}
        • Suggestions: ${suggestionsChannel.name || 'Not set'}
        • Suggestions Logs: ${suggestionsLogs.name || 'Not Set'}
        • Staff Suggestions: ${staffSuggestionsChannel.name || 'Not set'}
        • Staff Roles: ${roles.map(role => role.name).join(', ') || 'None set'}
        • Vote Emojis: ${emojiSets[voteEmojis] || 'Default'}
        • Total Suggestions: ${gSuggestions.length || 'None'}
        • Total Blacklists: ${gBlacklists.length || 'None'}
        • Responses Required: ${responses[responseRequired] || 'False'}`;
        
        return message.channel.send(config, { code: 'asciidoc' });
    }
};