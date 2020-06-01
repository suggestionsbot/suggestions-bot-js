const { MessageEmbed } = require('discord.js');
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

    const { embedColor, owners } = this.client.config;
    const { prefix } = settings;
    const { name } = this.help;

    const guarded = [
      message.author.id,
      ...owners
    ];

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
    const blEmbed = new MessageEmbed()
      .setColor(embedColor)
      .setTimestamp();

    if (!args[0]) {
      const activeBlacklists = gBlacklists
        .filter(b => (b.status === true) && (b.scope === 'global'));

      const blacklists = activeBlacklists.map(async blacklist => {
        let time;
        const issued = this.client.users.fetch(blacklist.userID);
        const issuer = this.client.users.fetch(blacklist.issuerID);
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

      const mappedBlacklists = await Promise.all(blacklists);

      for (const blacklist of mappedBlacklists) blEmbed.addField(blacklist.name, blacklist.value);

      blEmbed.setAuthor(`${message.guild} | Blacklisted Users`, message.guild.iconURL);
      blEmbed.setDescription(stripIndent`
        These users are currently blacklisted from using any of the bot commands **globally**.

        Use \`${prefix + name} help\` for more information.
      `);

      if (activeBlacklists.length < 1) {
        return message.channel.send(oneLine`There are currently no active blacklisted users globally. 
          Use \`${prefix + name} help\` for more information.`)
          .then(m => m.delete({ timeout: 5000 }));
      }

      return message.channel.send(blEmbed);
    }

    if (args[0] === 'help') return this.client.errors.noUsage(message.channel, this, settings);
    let blUser = message.mentions.users.size > 1 ? message.mentions.users.first().id : args[1];
    blUser = await this.client.users.fetch(blUser);
    const reason = args.slice(2).join(' ');

    if (!blUser) return this.client.errors.userNotFound(args[1], message.channel);
    if (guarded.includes(blUser.id) || await this.client.isStaff(message.guild, blUser)) {
      return message.channel.send('You cannot issue a blacklist to yourself or a guarded user!')
        .then(m => m.delete({ timeout: 5000 }))
        .catch(e => this.client.logger.error(e.stack));
    }

    switch(args[0]) {
    case 'add': {
      if (!blUser) return this.client.errors.userNotFound(args[1], message.channel);
      if (!reason) return message.channel.send('Please provide a reason!').then(msg => msg.delete({ timeout: 5000 })).catch(err => this.client.logger.error(err.stack));

      const newBlacklist = {
        guildID: message.guild.id,
        userID: blUser.id,
        reason: reason,
        issuerID: message.author.id,
        newTime: message.createdTimestamp,
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
        message.channel.send(blEmbed).then(msg => msg.delete({ timeout: 5000 }));
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
        data: {
          status: false,
          issuerID: message.author.id
        }
      };

      blEmbed.setTitle(`${this.client.user.username} | Blacklisted User Removed`);
      blEmbed.setColor('#d64541');
      blEmbed.addField('User ID', `${blUser} \`[${blUser.id}]\``, true);
      blEmbed.addField('Issuer', `${message.author} \`[${message.author.id}]\``);

      try {
        const check = await this.client.blacklists.checkRecentBlacklist(blUser, message.guild, true);
        if (check && !check.status) return this.client.errors.userAlreadyBlacklisted(message.channel, blUser);
        await this.client.blacklists.removeUserBlacklist(removeBlacklist);
        message.channel.send(blEmbed).then(msg => msg.delete({ timeout: 5000 }));
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
