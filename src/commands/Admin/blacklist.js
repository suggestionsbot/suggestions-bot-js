const { MessageEmbed } = require('discord.js-light');
const { oneLine, stripIndent } = require('common-tags');
const Command = require('../../structures/Command');
const Logger = require('../../utils/logger');
const { buildErrorEmbed } = require('../../utils/functions');

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
    const { colors, owners } = this.client.config;

    const guarded = [
      message.author.id,
      ...owners
    ];

    message.delete().catch(O_o=>{});

    let gBlacklists,
      total;
    try {
      gBlacklists = await this.client.mongodb.helpers.blacklists.getGuildBlacklists(message.guild);
      total = await this.client.mongodb.helpers.blacklists.getTotalBlacklists();
    } catch (err) {
      Logger.errorCmd(this, err.stack);
      return message.channel.send(buildErrorEmbed(err));
    }

    const caseNum = total + 1;
    const blEmbed = new MessageEmbed()
      .setColor(colors.main)
      .setFooter(`Guild: ${message.guild.id}`)
      .setTimestamp();

    if (!args[0]) {
      try {
        const activeBlacklists = gBlacklists
          .filter(b => (b.status === true) && (b.scope === 'guild'));

        const blacklists = activeBlacklists.map(async blacklist => {
          let time;
          const issued = await this.client.users.fetch(blacklist.userID, false);
          const issuer = await this.client.users.fetch(blacklist.issuerID, false);
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
          These users are currently blacklisted from using any of the bot commands in this guild.

          Use \`${prefix + name} help\` for more information.
        `);

        if (activeBlacklists.length < 1) {
          return message.channel.send(`There are currently no active blacklisted users. Use \`${prefix + name} help\` for more information.`)
            .then(m => m.delete({ timeout: 5000 }));
        }

        message.channel.send(blEmbed);
      } catch (err) {
        Logger.errorCmd(this, err.stack);
        return message.channel.send(buildErrorEmbed(err));
      }

      return;
    }

    if (args[0] === 'help') return this.client.errors.noUsage(message.channel, this, settings);
    let blUser = message.mentions.users.size >= 1 ? message.mentions.users.first().id : args[1];
    blUser = await this.client.users.fetch(blUser, false).catch(() => {
      return this.client.errors.userNotFound(args[1], message.channel);
    });
    const reason = args.slice(2).join(' ');

    if (!blUser) return this.client.errors.userNotFound(args[1], message.channel);
    if (guarded.includes(blUser.id) || await this.client.isStaff(message.guild, blUser)) {
      return message.channel.send('You cannot issue a blacklist to yourself or a guarded user!')
        .then(m => m.delete({ timeout: 5000 }))
        .catch(e => Logger.errorCmd(this, e.stack));
    }

    switch(args[0]) {
      case 'add': {
        if (!reason) {
          return message.channel.send('Please provide a reason!')
            .then(msg => msg.delete({ timeout: 5000 }))
            .catch(err => Logger.errorCmd(this, err.stack));
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
        blEmbed.setColor(colors.blacklist.add);
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
          .setColor(colors.blacklist.add)
          .setTimestamp();

        try {
          const check = await this.client.mongodb.helpers.blacklists.checkRecentBlacklist(blUser, message.guild);
          if (check && check.status) return this.client.errors.userAlreadyBlacklisted(message.channel, blUser);
          await this.client.mongodb.helpers.blacklists.addUserBlacklist(newBlacklist);
          message.channel.send(blEmbed).then(msg => msg.delete({ timeout: 5000 }));
          await blUser.send(dmBlacklistAdd);
        } catch (err) {
          Logger.errorCmd(this, err.stack);
          if (err.code === 50007) {
            return message.channel.send(oneLine`
            Bot blacklist has been issued. However, I could not DM **${blUser.tag}** because they either have DMs disabled
            or aren't a member of this server.
          `)
              .then(m => m.delete({ timeout: 5000 }));
          }
          return message.channel.send(buildErrorEmbed(err));
        }
        break;
      }
      case 'remove': {

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
        blEmbed.setColor(colors.blacklist.remove);
        blEmbed.addField('User ID', `${blUser} \`[${blUser.id}]\``, true);
        blEmbed.addField('Issuer', `${message.author} \`[${message.author.id}]\``);

        const dmBlacklistRemove = new MessageEmbed()
          .setDescription(stripIndent`
          Hello ${blUser},

          You have been unblacklisted by ${message.author}. This means you are now able to use the ${this.client.user}'s commands in the guild **${message.guild}**.

          **Reason:** ${reason ? reason : 'None provided'}
        `)
          .setColor(colors.blacklist.remove)
          .setTimestamp();

        try {
          const check = await this.client.mongodb.helpers.blacklists.checkRecentBlacklist(blUser, message.guild);
          if (check && !check.status) return this.client.errors.userNoLongerBlacklisted(message.channel, blUser);
          await this.client.mongodb.helpers.blacklists.removeUserBlacklist(removeBlacklist);
          message.channel.send(blEmbed).then(msg => msg.delete({ timeout: 5000 }));
          await blUser.send(dmBlacklistRemove);
        } catch (err) {
          if (err.code === 50007) {
            return message.channel.send(oneLine`
            Bot blacklist removal has been issued. However, I could not DM **${blUser.tag}** because they either have DMs disabled
            or aren't a member of this server.
          `)
              .then(m => m.delete({ timeout: 5000 }));
          }

          Logger.errorCmd(this, err.stack);
          return message.channel.send(buildErrorEmbed(err));
        }
        break;
      }
      default:
        this.client.errors.noUsage(message.channel, this, settings);
        break;
    }
  }
};
