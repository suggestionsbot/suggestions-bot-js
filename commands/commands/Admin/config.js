const { stripIndents } = require('common-tags');
const { RichEmbed } = require('discord.js');
const Command = require('../../Command');

const emojiSets = {
    defaultEmojis: 'Defaults',
    oldDefaults: 'Old Defaults',
    thumbsEmojis: 'Thumbs',
    arrowsEmojis: 'Arrows',
    greenEmojis: 'Green',
    fancyEmojis: 'Fancy'
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
            usage: 'config [option] [value]',
            adminOnly: true,
            botPermissions: ['MANAGE_MESSAGES']
        });
        this.voteEmojis = require('../../../utils/voteEmojis');
    }

    async run(message, args, settings) {

        const { embedColor, discord } = this.client.config;
        const { help: { usage, name } } = this;

        let gBlacklists = {};
        let gSuggestions = {};

        const setting = args[0],
            updated = args[1];

        try {
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
        } = settings;

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

        const config = stripIndents`
        • Guild Name: ${guildName} [${guildID}]
        • Guild Owner: ${guildOwner.user.tag} [${guildOwner.id}]
        • Prefix: ${prefix}
        • Suggestions: ${suggestionsChannel.name || 'Not set'}
        • Suggestions Logs: ${suggestionsLogs.name || 'Not Set'}
        • Staff Suggestions: ${staffSuggestionsChannel.name || 'Not set'}
        • Staff Roles: ${roles.map(role => role.name).join(', ') || 'None set'}
        • Vote Emojis: ${emojiSets[voteEmojis] || 'Default'}
        • Total Suggestions: ${gSuggestions.length || 'None'}
        • Total Blacklists: ${gBlacklists.length || 'None'}
        • Responses Required: ${responses[responseRequired] || 'False'}
        
        Do ${prefix + usage} to view information on a specific setting or update a setting.
        `;

        const configEmbed = new RichEmbed()
            .setAuthor(this.client.user.username, this.client.user.avatarURL)
            .setDescription(`
                To view more information on a specific configuration option: \`${prefix + name} [setting]\`.
                
                For updating a specific configuration option: \`${prefix + usage}\`
                `)
            .addField('Prefix', `\`${prefix + name} prefix\``, true)
            .addField('Suggestions Channel', `\`${prefix + name} channel\``, true)
            .addField('Suggestions Logs', `\`${prefix + name} logs\``, true)
            .addField('Staff Suggestions Channel', `\`${prefix + name} staffchannel\``, true)
            .addField('Staff Roles', `\`${prefix + name} roles\``, true)
            .addField('Vote Emojis', `\`${prefix + name} emojis\``, true)
            .addField('Rejection Responses', `\`${prefix + name} responses\``, true)
            .setColor(embedColor);

        switch (setting) {
            case 'prefix': {
                if (updated) {
                    try {
                        await this.client.settings.updateGuild(message.guild, { prefix: updated });
                        return message.channel.send(`Prefix has been updated to: \`${updated}\``);
                    } catch (err) {
                        this.client.logger.error(err);
                        return message.channel.send(`An error occurred: **${err.message}**`);
                    }
                }

                message.channel.send(`Current prefix: \`${prefix}\``);
                break;
            }
            case 'channel': {
                if (updated) {
                    const verified = message.guild.channels.find(c => c.name === updated) || message.guild.channels.find(c => c.toString() === updated);
                    if (!verified) {
                        return message.channel.send(`\`${updated}\` is not a channel!`).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err.stack));
                    }

                    try {
                        await this.client.settings.updateGuild(message.guild, { suggestionsChannel: verified.id });
                        return message.channel.send(`Suggestions channel has been updated to: \`${verified}\``);
                    } catch (err) {
                        this.client.logger.error(err);
                        return message.channel.send(`An error occurred: **${err.message}**`);
                    }
                }

                message.channel.send(`Current suggestions channel: ${suggestionsChannel}`);
                break;
            }
            case 'logs': {
                if (updated) {
                    const verified = message.guild.channels.find(c => c.name === updated) || message.guild.channels.find(c => c.toString() === updated);
                    if (!verified) {
                        return message.channel.send(`\`${updated}\` is not a channel!`).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err.stack));
                    }

                    try {
                        await this.client.settings.updateGuild(message.guild, { suggestionsLogs: verified.id });
                        return message.channel.send(`Suggestions channel has been updated to: \`${verified}\``);
                    } catch (err) {
                        this.client.logger.error(err);
                        return message.channel.send(`An error occurred: **${err.message}**`);
                    }
                }

                message.channel.send(`Current suggestions logs channel: ${suggestionsLogs}`);
                break;
            }
            case 'staffchannel': {
                if (updated) {
                    const verified = message.guild.channels.find(c => c.name === updated) || message.guild.channels.find(c => c.toString() === updated);
                    if (!verified) {
                        return message.channel.send(`\`${updated}\` is not a channel!`).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err.stack));
                    }

                    try {
                        await this.client.settings.updateGuild(message.guild, { staffSuggestionsChannel: verified.id });
                        return message.channel.send(`Suggestions channel has been updated to: \`${verified}\``);
                    } catch (err) {
                        this.client.logger.error(err);
                        return message.channel.send(`An error occurred: **${err.message}**`);
                    }
                }

                message.channel.send(`Current staff suggestions channel: ${staffSuggestionsChannel}`);
                break;
            }
            case 'roles': {
                if (updated) {
                    const verified = message.guild.roles.find(r => r.name === updated) || message.guild.roles.find(r => r.toString() === updated);
                    if (!verified) {
                        return message.channel.send(`\`${updated}\` is not a channel!`).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err.stack));
                    }

                    const filter = r => r.role === verified.id;
                    const sRole = staffRoles.find(filter);
                    let updateRole = {
                        query: { guildID: message.guild.id },
                        staffRoles: { role: verified.id },
                        added: false
                    };

                    if (sRole) {
                        try {
                            await this.client.settings.updateGuildStaffRoles(updateRole);
                            message.channel.send(`<:nerdSuccess:490708616056406017> Removed **${verified.name}** from the staff roles.`).then(msg => msg.delete(5000));
                        } catch (err) {
                            this.client.logger.error(err.stack);
                            return message.channel.send(`An error occurred: **${err.message}**`);
                        }
                    } else {
                        try {
                            updateRole = Object.assign(updateRole, { added: true });
                            await this.client.settings.updateGuildStaffRoles(updateRole);
                            message.channel.send(`<:nerdSuccess:490708616056406017> Added **${verified.name}** to the staff roles.`).then(msg => msg.delete(5000));
                        } catch (err) {
                            this.client.logger.error(err.stack);
                            return message.channel.send(`An error occurred: **${err.message}**`);
                        }
                    }

                    return;
                }

                const sRoles = message.guild.roles.filter(role => staffRoles.map(role => role.role).includes(role.id));
                const viewRoles = sRoles
                    .sort((a, b) => b.position - a.position)
                    .map(r => r.toString())
                    .join('\n') || null;

                const admins = message.guild.members
                    .filter(m => !m.user.bot && m.hasPermission('MANAGE_GUILD'))
                    .map(m => m.toString())
                    .join('\n');

                const embed = new RichEmbed()
                    .setAuthor(message.guild, message.guild.iconURL)
                    .setDescription(`Add/remove a staff role by doing \`${prefix + name} roles [role]\``)
                    .setColor(embedColor)
                    .addField('Admins', admins);

                if (staffRoles.length >= 1) embed.addField('Staff Roles', viewRoles);

                message.channel.send(embed);
                break;
            }
            case 'emojis': {
                const vEmojis = this.voteEmojis(this.client);
                const setID = parseInt(updated);

                if (updated) {
                    const filter = set => set.id === setID;
                    const foundSet = vEmojis.find(filter);
                    const emojiSet = foundSet.emojis;

                    if (!foundSet) {
                        return message.channel.send(`**${setID}** is not a valid emoji set id!`)
                            .then(msg => msg.delete(3000).catch(err => this.client.logger.error(err.stack)));
                    }

                    try {
                        await this.client.settings.updateGuild(message.guild, { voteEmojis: foundSet.name });
                        return message.channel.send(`The default vote emojis have been changed to ${emojiSet.join(' ')}.`)
                            .then(msg => msg.delete(5000)
                            .catch(err => this.client.logger.error(err)));
                    } catch (err) {
                        this.client.logger.error(err.stack);
                        return message.channel.send(`An error occurred: **${err.message}**`);
                    }
                }

                const embed = new RichEmbed()
                    .setAuthor(message.guild.name, message.guild.iconURL)
                    .setColor(embedColor)
                    .setFooter(`Guild ID: ${message.guild.id}`)
                    .setTimestamp();

                let view = '';
                let emojiSets = [];
                vEmojis.forEach(set => {

                    let emojiSet = set.emojis;

                    view = `\`${set.id}\`: ${emojiSet.join(' ')}`;
                    if (settings.voteEmojis === set.name) {
                        view = `\`${set.id}\`: ${emojiSet.join(' ')} ***(Currently Using)***`;
                    }

                    emojiSets.push(view);
                });

                if (!voteEmojis) {
                    let str = emojiSets[0].concat(' ', '***(Currently Using)***');
                    emojiSets[0] = str;
                }

                embed.setDescription(`
                    **Voting Emojis**
                    Choose from ${vEmojis.length} different emoji sets to be used for voting in your guild.

                    ${emojiSets.join('\n\n')}

                    You can do \`${prefix + name} emojis [id]\` to set the desired emojis.
                    Submit new emoji set suggestions any time by joining our Discord server: ${discord}
                    `);

                message.channel.send(embed);
                break;
            }
            case 'responses': {
                if (updated) {
                    switch (updated) {
                        case 'true':
                            try {
                                await this.client.settings.updateGuild(message.guild, { responseRequired: true });
                                message.channel.send('Responses required set to `true`. This means a response **is required** when using the `reject` command.').then(msg => msg.delete(5000));
                            } catch (err) {
                                this.client.logger.error(err.stack);
                                return message.channel.send(`Error setting required responses: **${err.message}**.`);
                            }
                            break;
                        case 'false':
                            try {
                                await this.client.settings.updateGuild(message.guild, { responseRequired: false });
                                message.channel.send('Responses required set to `false`. This means a response **is not required** when using the `reject` command.').then(msg => msg.delete(5000));
                            } catch (err) {
                                this.client.logger.error(err.stack);
                                return message.channel.send(`Error setting required responses: **${err.message}**.`);
                            }
                            break;
                        default:
                            message.channel.send('Value must be `true` or `false`.')
                                .then(m => m.delete(5000))
                                .catch(e => this.client.logger.error(e));
                            break;
                    }
                    return;
                }

                message.channel.send(`Rejection responses are currently **${responseRequired ? 'required' : 'not required'}**.`);
                break;
            }
            default: {
                // message.channel.send(config, { code: 'asciidoc' });
                message.channel.send(configEmbed);
                break;
            }
        }

        return;
    }
};