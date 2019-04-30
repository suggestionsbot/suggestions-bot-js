const { RichEmbed } = require('discord.js');
const moment = require('moment');
const Command = require('../../Command');
require('moment-duration-format');
require('moment-timezone');
moment.suppressDeprecationWarnings = true;

module.exports = class NoteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'note',
      category: 'Staff',
      description: 'Add a new note to a submitted suggestion.',
      usage: 'note <sID> <note>',
      staffOnly: true,
      guildOnly: false,
      botPermissions: ['MANAGE_MESSAGES']
    });
  }

  async run(message, args, settings) {

    const { embedColor } = this.client.config;

    message.delete().catch(O_o => {});

    const id = args[0];
    const note = args.slice(1).join(' ');
    if (!note) return this.client.errors.noUsage(message.channel, this, settings);

    let sID,
      guild = message.guild;
    try {
      sID = await this.client.suggestions.getGlobalSuggestion(id);
    } catch (err) {
      this.client.logger.error(err.stack);
      return message.channel.send(`Error querying the database for this suggestions: **${err.message}**.`);
    }

    if (!sID._id) return this.client.errors.noSuggestion(message.channel, id);

    if (!message.guild) {
      try {
        guild = this.client.guilds.get(sID.guildID);
        settings = await this.client.settings.getGuild(sID.guildID);
      } catch (err) {
        this.client.logger.error(err.message);
        return message.channel.send(`An error occurred: **${err.message}**`);
      }
    }

    const suggestionsChannel = guild.channels.find(c => c.name === settings.suggestionsChannel) ||
            (guild.channels.find(c => c.toString() === settings.suggestionsChannel)) ||
            (guild.channels.get(settings.suggestionsChannel));

    const {
      userID,
      username,
      status
    } = sID;

    if (status === 'approved' || status === 'rejected') return message.channel.send(`sID **${id}** has already been approved or rejected. Cannot do this action again.`).then(msg => msg.delete(3000)).catch(err => this.client.logger.error(err.stack));

    const sUser = guild.members.get(userID);
    if (!sUser) message.channel.send(`**${username}** is no longer in the guild, but a note will still be added to the suggestion.`).then(msg => msg.delete(3000)).catch(err => this.client.logger.error(err.stack));

    let fetchedMessages;
    try {
      fetchedMessages = await suggestionsChannel.fetchMessages({ limit: 100 });
    } catch (err) {
      this.client.logger.error(err.stack);
      return message.channel.send(`There was an error fetching messages from the ${suggestionsChannel}: **${err.message}**.`);
    }

    try {
      fetchedMessages.forEach(async msg => {

        const embed = msg.embeds[0];
        if (!embed) return;

        const suggestion = new RichEmbed(embed);

        const dmEmbed = new RichEmbed()
          .setAuthor(guild, guild.iconURL)
          .setDescription(`Hey, ${sUser}. ${message.author} has added a note to your suggestion:

                    Staff note: **${note}**
                                
                    Your suggestion ID (sID) for reference was **${id}**.
                    `)
          .setColor(embedColor)
          .setFooter(`Guild ID: ${guild.id} | sID: ${id}`)
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

        const footer = embed.footer.text;
        if (footer.includes(id)) {
          const staffNote = {
            note,
            staffMemberID: message.author.id,
            newNoteAdded: message.createdAt.getTime()
          };

          const suggestionNote = {
            query: [
              { guildID: guild.id },
              { sID: id }
            ],
            data: staffNote
          };

          try {
            const sMessage = await suggestionsChannel.fetchMessage(embed.message.id);

            message.channel.send(`Added a note to **${id}**: **${note}**.`).then(m => m.delete(5000));
            sMessage.edit(suggestion);
            try {
              if (settings.dmResponses) sUser.send(dmEmbed);
            } catch (err) {
              this.client.logger.error(err.stack);
              message.channel.send(`An error occurred DMing **${sUser.displayName}** their suggestion note: **${err.message}**.`);
            }

            await this.client.suggestions.addGuildSuggestionNote(suggestionNote);
          } catch (err) {
            this.client.logger.error(err.stack);
            message.delete(3000).catch(O_o => {});
            message.channel.send(`Error updating this suggestion in the database: **${err.message}**`);
          }
        }
      });
    } catch (err) {
      this.client.logger.error(err.stack);
      message.delete(3000).catch(O_o => {});
      message.channel.send(`Error adding a note to this suggestion in the database: **${err.message}**`);
    }
    return;
  }
};
