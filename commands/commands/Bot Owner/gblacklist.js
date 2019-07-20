const { RichEmbed } = require('discord.js');
const { oneLine, stripIndent } = require('common-tags');
const Command = require('../../Command');

module.exports = class GBlacklistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'gblacklist',
      category: 'Bot Owner',
      description: 'Add or remove a user from the bot blacklist (globally).',
      usage: 'gblacklist <add/remove> <user ID> <reason>',
      ownerOnly: true,
      guildOnly: false,
      botPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS']
    });
    this.blStatus = {
      true: 'Active',
      false: 'Inactive'
    };
  }

  async run(message, args, settings) {

    const { embedColor } = this.client.config;
    const { prefix } = settings;
    const { name } = this.help;

    message.delete().catch(O_o=>{});

    let gBlacklists,
      total;
    try {
      gBlacklists = await this.client.blacklists.getGlobalBlacklists();
      total = await this.client.blacklists.getTotalBlacklists();

    } catch (err) {
      this.client.logger.error(err.stack);
      return message.channel.send(`An error occurred: **${err.message}**`);
    }

    const caseNum = total + 1;
    const blEmbed = new RichEmbed()
      .setColor(embedColor)
      .setTimestamp();

    if (!args[0]) {
      const activeBlacklists = gBlacklists
        .filter(b => (b.status === true) && (b.scope === 'global'));

      const blacklists = activeBlacklists.map(blacklist => {
        let time;
        const issued = this.client.users.get(blacklist.userID);
        const issuer = this.client.users.get(blacklist.issuerID);
        const num = blacklist.case;
        const reason = blacklist.reason;
        const caseStatus = this.blStatus[blacklist.status];
        if (blacklist.time && !blacklist.newTime) time = new Date(blacklist.time);
        if (!blacklist.time && blacklist.newTime) time = new Date(blacklist.newTime);

        const value = `
          **User:** ${issued.tag} \`[${issued.id}]\` 
          **Reason:** ${reason}
          **Issuer:** ${issuer.tag} \`[${issuer.id}]\` 
          **Status:** ${caseStatus} 
          **Issued:** ${time.toLocaleDateString()}
        `;

        return {
          name: `Case #${num}`,
          value
        };
      });

      for (const blacklist of blacklists) blEmbed.addField(blacklist.name, blacklist.value);

      blEmbed.setAuthor(`${message.guild} | Blacklisted Users`, message.guild.iconURL);
      blEmbed.setDescription(stripIndent`
        These users are currently blacklisted from using any of the bot commands **globally**.

        Use \`${prefix + name} help\` for more information.
      `);

      if (activeBlacklists.length < 1) {
        return message.channel.send(oneLine`There are currently no active blacklisted users globally. 
          Use \`${prefix + name} help\` for more information.`)
          .then(m => m.delete(5000));
      }

      return message.channel.send(blEmbed);
    }

    if (args[0] === 'help') return this.client.errors.noUsage(message.channel, this, settings);

    const blUser = this.client.users.get(args[1]) || message.mentions.users.first();
    const reason = args.slice(2).join(' ');

    if (!blUser) return this.client.errors.userNotFound(args[1], message.channel);
    if (blUser.id === message.author.id) {
      return message.channel.send('You cannot issue a blacklist to yourself!')
        .then(m => m.delete(5000))
        .catch(e => this.client.logger.error(e.stack));
    }

    switch(args[0]) {
    case 'add': {
      if (!blUser) return this.client.errors.userNotFound(args[1], message.channel);
      if (!reason) return message.channel.send('Please provide a reason!').then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err.stack));

      const newBlacklist = {
        guildID: message.guild.id,
        userID: blUser.id,
        reason: reason,
        issuerID: message.author.id,
        newTime: message.createdAt.getTime(),
        status: true,
        case: caseNum,
        scope: 'global'
      };

      blEmbed.setTitle(`${this.client.user.username} | Blacklisted User Added`);
      blEmbed.setColor('#00e640');
      blEmbed.addField('User', `${blUser} \`[${blUser.tag}]\``, true);
      blEmbed.addField('Reason', reason, true);
      blEmbed.addField('Issuer', `${message.author} \`[${message.author.id}]\``);

      try {
        const check = await this.client.blacklists.checkRecentBlacklist(blUser, message.guild, true);
        if (check && check.status) return this.client.errors.userAlreadyBlacklisted(message.channel, blUser);
        await this.client.blacklists.addUserBlacklist(newBlacklist);
        message.channel.send(blEmbed).then(msg => msg.delete(5000));
      } catch (err) {
        this.client.logger.error(err.stack);
        message.channel.send(`An error occurred: **${err.message}**.`);
      }
      break;
    }
    case 'remove': {
      if (!blUser) return this.client.errors.userNotFound(args[1], message.channel);
      const removeBlacklist = {
        query: [
          { userID: blUser.id },
          { status: true }
        ],
        data: { status: false }
      };

      blEmbed.setTitle(`${this.client.user.username} | Blacklisted User Removed`);
      blEmbed.setColor('#d64541');
      blEmbed.addField('User ID', `${blUser} \`[${blUser.id}]\``, true);
      blEmbed.addField('Issuer', `${message.author} \`[${message.author.id}]\``);

      try {
        const check = await this.client.blacklists.checkRecentBlacklist(blUser, message.guild, true);
        if (check && !check.status) return this.client.errors.userAlreadyBlacklisted(message.channel, blUser);
        await this.client.blacklists.removeUserBlacklist(removeBlacklist);
        message.channel.send(blEmbed).then(msg => msg.delete(5000));
      } catch (err) {
        this.client.logger.error(err.stack);
        message.channel.send(`An error occurred: **${err.message}**.`);
      }
      break;
    }
    default:
      this.client.errors.noUsage(message.channel, this, settings);
      break;
    }
    return;
  }
};
