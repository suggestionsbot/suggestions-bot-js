const { MessageEmbed } = require('discord.js-light');
const { oneLine } = require('common-tags');
const Command = require('../../structures/Command');
const { validateSnowflake, messageDelete, getChannelAndCache } = require('../../utils/functions');
const Logger = require('../../utils/logger');

module.exports = class NoteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'note',
      category: 'Staff',
      description: 'Add a new note to a submitted suggestion.',
      usage: 'note <sID|message ID> <note>',
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

    let document;
    try {
      if ([7, 8].includes(id.length)) document = await this.client.mongodb.helpers.suggestions.getGlobalSuggestion(id);
      else if (validateSnowflake(id)) document = await this.client.mongodb.helpers.suggestions.getGuildSuggestionViaMessageID(message.guild, id);
      else return message.channel.send(`\`${id}\` does not resolve to or return a valid suggestion!`);
    } catch (err) {
      Logger.errorCmd(this, err.stack);
      return message.channel.send(`Error querying the database for this suggestions: **${err.message}**.`);
    }

    const {
      sID,
      userID,
      messageID,
      status
    } = document;

    const sUser = await this.client.users.fetch(userID).catch(err => Logger.errorCmd(this, err));

    let suggestionsChannel;
    try {
      suggestionsChannel = settings.suggestionsChannel && await getChannelAndCache(this.client, settings.suggestionsChannel, message.guild);
      if (!suggestionsChannel) return this.client.errors.noSuggestions(message.channel);
    } catch (error) {
      if (!suggestionsChannel) return this.client.errors.noSuggestions(message.channel);
      Logger.errorCmd(this, error.stack);
      return message.channel.send(`An error occurred: **${error.message}**`);
    }


    if (status === 'approved' || status === 'rejected') {
      return message.channel.send(`sID **${sID}** has already been approved or rejected. Cannot do this action again.`)
        .then(msg => messageDelete(msg, 3000))
        .catch(err => Logger.errorCmd(this, err.stack));
    }

    if (!messageID) {
      return message.channel.send(oneLine`
        Oops! The message ID was not found for this suggestion! 
        Please contact the developer via the Support Discord: ${this.client.config.discord}
      `);
    }

    let sMessage;
    try {
      sMessage = await suggestionsChannel.messages.fetch(messageID);
    } catch (err) {
      Logger.errorCmd(this, err.stack);
      message.channel.send('The suggestion message was not found, but still will be updated!')
        .then(m => messageDelete(m, 5000));
    }

    const suggestion = new MessageEmbed(sMessage.embeds[0]);

    const dmEmbed = new MessageEmbed()
      .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL() })
      .setDescription(`Hey, ${sUser}. ${message.author} has added a note to your suggestion:

        Staff note: **${note}**
                    
        Your suggestion ID (sID) for reference was **${sID}**.
      `)
      .setColor(embedColor)
      .setFooter({ text: `Guild ID: ${message.guild.id} | sID: ${sID}` })
      .setTimestamp();

    if (suggestion.fields.length && suggestion.fields[0].name === 'Staff Note') {
      suggestion.fields[0].value = note;
      suggestion.fields[1].value = `${message.author} (${message.author.id})`;

      dmEmbed.setDescription(`Hey, ${sUser}. ${message.author} has updated a note on your suggestion:

      Staff note: **${note}**
                  
      Your suggestion ID (sID) for reference was **${sID}**.
      `);
    } else {
      suggestion.addField('Staff Note', note);
      suggestion.addField('Staff Member', `${message.author} \`[${message.author.id}]\``);
    }

    const suggestionNote = {
      query: [
        { guildID: message.guild.id },
        { sID }
      ],
      data: {
        note,
        staffMemberID: message.author.id,
        noteAdded: message.createdTimestamp
      }
    };

    try {
      message.channel.send(`Added a note to **${sID}**: **${note}**.`).then(m => messageDelete(m, 5000));
      await this.client.mongodb.helpers.suggestions.addGuildSuggestionNote(suggestionNote);
      await sMessage.edit({ embeds: [suggestion] });
      await message.guild.members.fetch(userID);
      if (settings.dmResponses) await sUser.send({ embeds: [dmEmbed] });
    } catch (err) {
      if (err.message === 'Unknown Member') return;
      if (err.message === 'Cannot send messages to this user') return;
      Logger.errorCmd(this, err.stack);
      messageDelete(message, 3000).catch(O_o => {});
      message.channel.send(`Error updating this suggestion in the database: **${err.message}**`);
    }
  }
};
