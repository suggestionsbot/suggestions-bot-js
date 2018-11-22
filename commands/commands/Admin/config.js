const { stripIndents } = require('common-tags');
const Command = require('../../Command');

const emojiSets = {
    defaultEmojis: 'Default',
    thumbsEmojis: 'Thumbs',
    arrowsEmojis: 'Arrows',
    christmasEmojis: 'Christmas',
    jingleBellsEmojis: 'Bells'
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

        let gSettings = await this.client.getSettings(message.guild).catch(err => {
            this.client.logger.error(err);
            return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
        });

        let gBlacklists = await this.client.getGuildBlacklist(message.guild).catch(err => {
            this.client.logger.error(err);
            return message.channel.send(`Error querying the database for this guild's blacklisted users: **${err.message}**.`);
        });

        let gSuggestions = await this.client.getGuildSuggestions(message.guild).catch(err => {
            this.client.logger.error(err);
            return message.channel.send(`Error querying the database for this guild's suggestions: **${err.message}**.`);
        });

        let {
            guildID,
            guildName,
            guildOwnerID,
            prefix,
            suggestionsChannel,
            suggestionsLogs,
            staffSuggestionsChannel,
            staffRoles,
            voteEmojis
        } = gSettings;

        const guildOwner = message.guild.members.get(guildOwnerID);
        
        let roles = message.guild.roles.filter(role => staffRoles.map(role => role.role).includes(role.id));

        suggestionsChannel = message.guild.channels.find(c => c.name === suggestionsChannel) || (message.guild.channels.find(c => c.toString() === suggestionsChannel)) || (message.guild.channels.get(suggestionsChannel)) || '';
        suggestionsLogs = message.guild.channels.find(c => c.name === suggestionsLogs) || message.guild.channels.find(c => c.toString() === suggestionsLogs) || message.guild.channels.get(suggestionsLogs) || '';
        staffSuggestionsChannel = message.guild.channels.find(c => c.name === staffSuggestionsChannel) || (message.guild.channels.find(c => c.toString() === staffSuggestionsChannel)) || (message.guild.channels.find(c => c.id === staffSuggestionsChannel)) || '';

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
        • Total Blacklists: ${gBlacklists.length || 'None'}`;

        return message.channel.send(config, { code: 'asciidoc' });
    }
};