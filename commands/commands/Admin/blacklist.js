const { MessageEmbed } = require('discord.js');
const { oneLine, stripIndent } = require('common-tags');
const Command = require('../../Command');

module.exports = class BlacklistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'blacklist',
      category: 'Admin',
      description: 'Add or remove a user from the bot blacklist (guild-only).',
      usage: 'blacklist <add/remove> <@User/User ID> <reason>',
      adminOnly: true,
      botPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS']
    });
    this.blStatus = {
      true: 'Active',
      false: 'Inactive'
    };
  }

  async run(message, args, settings) {

    const { name } = this.help;
    const { prefix } = settings;
    const { embedColor } = this.client.config;

    message.delete().catch(O_o=>{});

    let gBlacklists,
      total;
    try {
      gBlacklists = await this.client.blacklists.getGuildBlacklists(message.guild);
      total = await this.client.blacklists.getTotalBlacklists();
    } catch (err) {
      this.client.logger.error(err.stack);
      return message.channel.send(`An error occurred: **${err.message}**`);
    }

    const caseNum = total + 1;
    const blEmbed = new MessageEmbed()
      .setColor(embedColor)
      .setFooter(`Guild: ${message.guild.id}`)
      .setTimestamp();

    if (!args[0]) {
      try {
        const activeBlacklists = gBlacklists
          .filter(b => (b.status === true) && (b.scope === 'guild'));

        const blacklists = activeBlacklists.map(blacklist => {
          let time;
          const issued = this.client.users.cache.get(blacklist.userID);
          const issuer = this.client.users.cache.get(blacklist.issuerID);
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
          These users are currently blacklisted from using any of the bot commands in this guild.

          Use \`${prefix + name} help\` for more information.
        `);

        if (activeBlacklists.length < 1) {
          return message.channel.send(`There are currently no active blacklisted users. Use \`${prefix + name} help\` for more information.`)
            .then(m => m.delete({ timeout: 5000 }));
        }

        message.channel.send(blEmbed);
      } catch (err) {
        this.client.logger.error(err.stack);
        return message.channel.send(`An error occurred: **${err.message}**`);
      }

      return;
    }

    if (args[0] === 'help') return this.client.errors.noUsage(message.channel, this, settings);

    const blUser = this.client.users.cache.get(args[1]) || message.mentions.users.first();
    const reason = args.slice(2).join(' ');

    if (!blUser) return this.client.errors.userNotFound(args[1], message.channel);
    if (blUser.id === message.author.id) {
      return message.channel.send('You cannot issue a blacklist to yourself!')
        .then(m => m.delete({ timeout: 5000 }))
        .catch(e => this.client.logger.error(e.stack));
    }

    switch(args[0]) {
    case 'add': {
      if (!reason) {
        return message.channel.send('Please provide a reason!')
          .then(msg => msg.delete({ timeout: 5000 }))
          .catch(err => this.client.logger.error(err.stack));
      }

      const newBlacklist = {
        guildID: message.guild.id,
        userID: blUser.id,
        reason: reason,
        issuerID: message.author.id,
        newTime: message.createdTimestamp,
        status: true,
        case: caseNum
      };

      blEmbed.setTitle(`${this.client.user.username} | Blacklisted User Added`);
      blEmbed.setColor('#00e640');
      blEmbed.addField('User', `${blUser} \`[${blUser.tag}]\``, true);
      blEmbed.addField('Reason', reason, true);
      blEmbed.addField('Issuer', `${message.author} \`[${message.author.id}]\``);


      const dmBlacklistAdd = new MessageEmbed()
        .setDescription(stripIndent`
          Hello ${blUser},

          You have been blacklisted by ${message.author} from using any of the ${this.client.user}'s commands in the guild **${message.guild}**.
          
          This blacklist does not expire and can only be removed at the discretion of a server administrator. You may find the reason below.

          **Reason:** ${reason}
          `)
        .setColor('#00e640')
        .setTimestamp();

      try {
        const check = await this.client.blacklists.checkRecentBlacklist(blUser, message.guild);
        if (check && check.status) return this.client.errors.userAlreadyBlacklisted(message.channel, blUser);
        await this.client.blacklists.addUserBlacklist(newBlacklist);
        message.channel.send(blEmbed).then(msg => msg.delete({ timeout: 5000 }));
        await blUser.send(dmBlacklistAdd);
      } catch (err) {
        this.client.logger.error(err.stack);
        if (err.code === 50007) {
          return message.channel.send(oneLine`
            Bot blacklist has been issued. However, I could not DM **${blUser.tag}** because they either have DMs disabled
            or aren't a member of this server.
          `)
            .then(m => m.delete({ timeout: 5000 }));
        }
        message.channel.send(`An error occurred: **${err.message}**.`);
      }
      break;
    }
    case 'remove': {

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

      const dmBlacklistRemove = new MessageEmbed()
        .setDescription(stripIndent`
          Hello ${blUser},

          You have been unblacklisted by ${message.author}. This means you are now able to use the ${this.client.user}'s commands in the guild **${message.guild}**.

          **Reason:** ${reason ? reason : 'None provided'}
        `)
        .setColor('#d64541')
        .setTimestamp();

      try {
        const check = await this.client.blacklists.checkRecentBlacklist(blUser, message.guild);
        if (check && !check.status) return this.client.errors.userNoLongerBlacklisted(message.channel, blUser);
        await this.client.blacklists.removeUserBlacklist(removeBlacklist);
        message.channel.send(blEmbed).then(msg => msg.delete({ timeout: 5000 }));
        await blUser.send(dmBlacklistRemove);
      } catch (err) {
        this.client.logger.error(err.stack);
        if (err.code === 50007) {
          return message.channel.send(oneLine`
            Bot blacklist removal has been issued. However, I could not DM **${blUser.tag}** because they either have DMs disabled
            or aren't a member of this server.
          `)
            .then(m => m.delete({ timeout: 5000 }));
        }
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
