const { MessageEmbed } = require('discord.js');
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

    let sID,
      guild = message.guild;
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

    if (!message.guild) {
      try {
        guild = await this.client.shard.broadcastEval(`this.client.guilds.cache.get('${sID.guildID}');`);
        guild = guild[0];
        settings = await this.client.settings.getGuild(sID.guildID);
      } catch (err) {
        this.client.logger.error(err.message);
        return message.channel.send(`An error occurred: **${err.message}**`);
      }
    }

    const suggestionsChannel = guild.channels.cache.find(c => c.name === settings.suggestionsChannel) ||
      (guild.channels.cache.get(settings.suggestionsChannel));

    if (status === 'approved' || status === 'rejected') {
      return message.channel.send(`sID **${id}** has already been approved or rejected. Cannot do this action again.`)
        .then(msg => msg.delete({ timeout: 3000 }))
        .catch(err => this.client.logger.error(err.stack));
    }

    if (!guild.member(userID)) {
      message.channel.send(`**${sUser.tag}** is no longer in the guild, but a note will still be added to the suggestion.`)
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
      sMessage = await suggestionsChannel.messages.fetch(messageID);
    } catch (err) {
      this.client.logger.error(err.stack);
      message.channel.send('The suggestion message was not found, but still will be updated!')
        .then(m => m.delete({ timeout: 5000 }));
    }

    const embed = sMessage.embeds[0];

    const suggestion = new MessageEmbed(embed);

    const dmEmbed = new MessageEmbed()
      .setAuthor(guild, guild.iconURL())
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
      suggestion.addField('Staff Member', `${message.author} \`[${message.author.id}]\``);
    }

    const suggestionNote = {
      query: [
        { guildID: guild.id },
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
      sMessage.edit(suggestion);
      try {
        if (settings.dmResponses && guild.members.cache.get(sUser.id)) sUser.send(dmEmbed);
      } catch (err) {
        this.client.logger.error(err.stack);
        message.channel.send(`An error occurred DMing **${sUser.tag}** their suggestion note: **${err.message}**.`);
      }

      await this.client.suggestions.addGuildSuggestionNote(suggestionNote);
    } catch (err) {
      this.client.logger.error(err.stack);
      message.delete({ timeout: 3000 }).catch(O_o => {});
      message.channel.send(`Error updating this suggestion in the database: **${err.message}**`);
    }

    return;
  }
};
