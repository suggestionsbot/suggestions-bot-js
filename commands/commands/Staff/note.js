const { RichEmbed } = require('discord.js');
const moment = require('moment');
const Command = require('../../Command');
const Suggestion = require('../../../models/suggestions');
const { noSuggestionsLogs } = require('../../../utils/errors');
require('moment-duration-format');
require('moment-timezone');
moment.suppressDeprecationWarnings = true;

module.exports = class NoteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'note',
            category: 'Staff',
            description: 'Add a note to a submitted suggestion.',
            usage: 'note <sID> <note>',
            staffOnly: true,
            botPermissions: ['MANAGE_MESSAGES']
        });
    }

    async run(message, args) {
        
        const usage = this.help.usage;
        let { embedColor } = this.client.config;

        message.delete().catch(O_o => {});

        let gSettings = {};
        try {
            gSettings = await this.client.getSettings(message.guild);
        } catch (err) {
            this.client.logger.error(err);
            return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
        }

        const suggestionsChannel = message.guild.channels.find(c => c.name === gSettings.suggestionsChannel) || (message.guild.channels.find(c => c.toString() === gSettings.suggestionsChannel)) || (message.guild.channels.get(gSettings.suggestionsChannel));

        let id = args[0];
        let note = args.slice(1).join(' ');
        if (!id && !note) return message.channel.send(`Usage: \`${gSettings.prefix + usage}\``).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err));

        let date = moment(Date.now()).format();

        let sID = await this.client.getGuildSuggestion(message.guild, id).catch(err => {
            this.client.logger.error(err);
            return message.channel.send(`Error querying the database for this guild's suggestions: **${err.message}**.`);
        });

        if (await this.client.isEmpty(sID)) return message.channel.send(`Could not find the suggestion with the sID **${args[0]}** in the guild database.`).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err));

        let {
            userID,
            username,
            status
        } = sID;

        if (status === 'approved' || status === 'rejected') return message.channel.send(`sID **${id}** has already been approved or rejected. Cannot do this action again.`).then(msg => msg.delete(3000)).catch(err => this.client.logger.error(err));

        const sUser = message.guild.members.get(userID);
        if (!sUser) message.channel.send(`**${username}** is no longer in the guild, but a note will still be added to the suggestion.`).then(msg => msg.delete(3000)).catch(err => this.client.logger.error(err));

        let fetchedMessages = await suggestionsChannel.fetchMessages({ limit: 100 }).catch(err => {
            this.client.logger.error(err);
            return message.channel.send(`There was an error fetching messages from the ${suggestionsChannel}: **${err.message}**.`);
        });

        try {

            fetchedMessages.forEach(async msg => {

                let embed = msg.embeds[0];
                if (!embed) return;

                const suggestion = new RichEmbed(embed);

                const dmEmbed = new RichEmbed()
                    .setAuthor(message.guild, message.guild.iconURL)
                    .setDescription(`Hey, ${sUser}. ${message.author} has added a note to your suggestion:

                    Staff note: **${note}**
                                
                    Your suggestion ID (sID) for reference was **${id}**.
                    `)
                    .setColor(embedColor)
                    .setFooter(`Guild ID: ${message.guild.id} | sID: ${id}`)
                    .setTimestamp();

                if (embed.fields.length && embed.fields[0].name === 'Staff Note') {
                    suggestion.fields[0].value = note;
                    suggestion.fields[1].value = `${message.author} (${message.author.id})`;

                    dmEmbed.setDescription(`Hey, ${sUser}. ${message.author} has updated a note on your suggestion:

                    Staff note: **${note}**
                                
                    Your suggestion ID (sID) for reference was **${id}**.
                    `);
                } else {
                    suggestion.addField('Staff Note', note);
                    suggestion.addField('Staff Member', `${message.author} (${message.author.id})`);
                }

                let footer = embed.footer.text;
                let staffNote = {
                    note,
                    staffMemberID: message.author.id,
                    staffMemberUsername: message.author.tag,
                    noteAdded: date
                };

                if (footer.includes(id)) {

                    let sMessage = await suggestionsChannel.fetchMessage(embed.message.id);

                    message.channel.send(`Added a note to **${id}**: **${note}**.`).then(msg => msg.delete(5000));
                    sMessage.edit(suggestion);
                    sUser.send(dmEmbed).catch(err => {
                        this.client.logger.error(err);
                        message.channel.send(`An error occurred DMing **${sUser.displayName}** their suggestion note: **${err.message}**.`);
                    });

                    Suggestion.findOneAndUpdate({
                        $and: [
                            { guildID: message.guild.id },
                            { sID: id }
                        ]},
                        {
                            $push: {
                                notes: staffNote
                            }
                    }).then(() => {
                        this.client.logger.log(`sID ${id} had a note added by ${message.author.tag} (${message.author.id}) "${message.guild.name}" (${message.guild.id}).`);
                    })   
                    .catch(err => {
                        this.client.logger.error(err);
                        message.delete(3000).catch(O_o => {});
                        return message.channel.send(`Error updating this suggestion in the database: **${err.message}**`);
                    });
                }
            });
        } catch (err) {
            this.client.logger.error(err);
            message.delete(3000).catch(O_o => {});
            message.channel.send(`Error adding a note to this suggestion in the database: **${err.message}**`);
        }
        return;
    }
};