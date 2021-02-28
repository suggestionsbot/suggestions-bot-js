const { MessageEmbed } = require('discord.js-light');
const moment = require('moment');
const { oneLine } = require('common-tags');
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
      botPermissions: ['MANAGE_MESSAGES'],
      enabled: true
    });
  }

  async run(message, args, settings) {

    const { embedColor } = this.client.config;

    message.delete().catch(O_o => {});

    const id = args[0];
    const note = args.slice(1).join(' ');
    if (!note) return this.client.errors.noUsage(message.channel, this, settings);

    const guild = message.guild;
    let sID;
    try {
      sID = await this.client.suggestions.getGlobalSuggestion(id);
    } catch (err) {
      this.client.logger.error(err.stack);
      return message.channel.send(`Error querying the database for this suggestions: **${err.message}**.`);
    }

    if (!sID) return this.client.errors.noSuggestion(message.channel, id);

    const {
      userID,
      messageID,
      status
    } = sID;

    const sUser = await this.client.users.fetch(userID).catch(err => this.client.logger.error(err));

    let suggestionsChannel;
    try {
      suggestionsChannel = settings.suggestionsChannel && (
        settings.suggestionsChannel === 'suggestions'
          ? await message.guild.channels.fetch({ cache: false })
            .then(res => res.find(c => c.name === 'suggestions'))
          : await message.guild.channels.fetch(settings.suggestionsChannel)
      );
      if (!suggestionsChannel) return this.client.errors.noSuggestions(message.channel);
    } catch (error) {
      if (!suggestionsChannel) return this.client.errors.noSuggestions(message.channel);
      this.client.logger.error(error.stack);
      return message.channel.send(`An error occurred: **${error.message}**`);
    }


    if (status === 'approved' || status === 'rejected') {
      return message.channel.send(`sID **${id}** has already been approved or rejected. Cannot do this action again.`)
        .then(msg => msg.delete({ timeout: 3000 }))
        .catch(err => this.client.logger.error(err.stack));
    }

    if (!messageID) {
      return message.channel.send(oneLine`
        Oops! The message ID was not found for this suggestion! 
        Please contact the developer via the Support Discord: ${this.client.config.discord}
      `);
    }

    let sMessage;
    try {
      sMessage = await suggestionsChannel.messages.fetch(messageID, false);
    } catch (err) {
      this.client.logger.error(err.stack);
      message.channel.send('The suggestion message was not found, but still will be updated!')
        .then(m => m.delete({ timeout: 5000 }));
    }

    const suggestion = new MessageEmbed(sMessage.embeds[0]);

    const dmEmbed = new MessageEmbed()
      .setAuthor(guild, message.guild.iconURL())
      .setDescription(`Hey, ${sUser}. ${message.author} has added a note to your suggestion:

        Staff note: **${note}**
                    
        Your suggestion ID (sID) for reference was **${id}**.
      `)
      .setColor(embedColor)
      .setFooter(`Guild ID: ${message.guild.id} | sID: ${id}`)
      .setTimestamp();

    if (suggestion.fields.length && suggestion.fields[0].name === 'Staff Note') {
      suggestion.fields[0].value = note;
      suggestion.fields[1].value = `${message.author} (${message.author.id})`;

      dmEmbed.setDescription(`Hey, ${sUser}. ${message.author} has updated a note on your suggestion:

      Staff note: **${note}**
                  
      Your suggestion ID (sID) for reference was **${id}**.
      `);
    } else {
      suggestion.addField('Staff Note', note);
      suggestion.addField('Staff Member', `${message.author} \`[${message.author.id}]\``);
    }

    const suggestionNote = {
      query: [
        { guildID: message.guild.id },
        { sID: id }
      ],
      data: {
        note,
        staffMemberID: message.author.id,
        noteAdded: message.createdTimestamp
      }
    };

    try {
      message.channel.send(`Added a note to **${id}**: **${note}**.`).then(m => m.delete({ timeout: 5000 }));
      await this.client.suggestions.addGuildSuggestionNote(suggestionNote);
      await sMessage.edit(suggestion);
      await message.guild.members.fetch({ user: userID, cache: false });
      if (settings.dmResponses) await sUser.send(dmEmbed);
    } catch (err) {
      if (err.message === 'Unknown Member') return;
      if (err.message === 'Cannot send messages to this user') return;
      this.client.logger.error(err.stack);
      message.delete({ timeout: 3000 }).catch(O_o => {});
      message.channel.send(`Error updating this suggestion in the database: **${err.message}**`);
    }
  }
};
