const { stripIndents } = require('common-tags');
const Command = require('../../base/Command');
const { noBotPerms } = require('../../utils/errors');

const emojiSets = {
    defaultEmojis: 'Default',
    thumbsEmojis: 'Thumbs',
    arrowsEmojis: 'Arrows',
    christmasEmojis: 'Christmas',
    jingleBellsEmojis: 'Bells'
};

module.exports = class Config extends Command {
    constructor(client) {
        super(client, {
            name: 'config',
            category: 'Admin',
            description: 'View a text-based version of the bot configuration for the guild.',
            aliases: ['conf', 'viewconf', 'viewconfig', 'settings'],
            adminOnly: true
        });
    }

    async run(message, args) {

        let perms = message.guild.me.permissions;
        if (!perms.has('MANAGE_MESSAGES')) return noBotPerms(message, 'MANAGE_MESSAGES');
        
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
            staffSuggestionsChannel,
            staffRoles,
            voteEmojis
        } = gSettings;

        const guildOwner = message.guild.members.get(guildOwnerID);

        let roles = [];
        if (staffRoles.length >= 1) {
            staffRoles.forEach(role => {
                let gRole = message.guild.roles.find(r => r.id === role.role);
                if (gRole) return roles.push(gRole);
            });
        }
        
        suggestionsChannel = message.guild.channels.find(c => c.name === suggestionsChannel) || (message.guild.channels.find(c => c.toString() === suggestionsChannel)) || (message.guild.channels.find(c => c.id === suggestionsChannel));
        staffSuggestionsChannel = message.guild.channels.find(c => c.name === staffSuggestionsChannel) || (message.guild.channels.find(c => c.toString() === staffSuggestionsChannel)) || (message.guild.channels.find(c => c.id === staffSuggestionsChannel)) || '';

        let config = stripIndents`
        • Guild Name: ${guildName} (${guildID})
        • Guild Owner: ${guildOwner.user.tag} (${guildOwner.id})
        • Prefix: ${prefix}
        • Suggestions: ${suggestionsChannel.name}
        • Staff Suggestions: ${staffSuggestionsChannel.name || 'Not set'}
        • Staff Roles: ${roles.map(role => role.name).join(', ') || 'None set'}
        • Vote Emojis: ${emojiSets[voteEmojis] || 'Default'}
        • Total Suggestions: ${gSuggestions.length || 'None'}
        • Total Blacklists: ${gBlacklists.length || 'None'}`;

        message.channel.send(config, { code: 'asciidoc' });
    }
};