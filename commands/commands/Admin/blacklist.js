const { RichEmbed } = require('discord.js');
const { oneLine } = require('common-tags');
const Command = require('../../Command');

module.exports = class BlacklistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'blacklist',
      category: 'Admin',
      description: 'Add or remove a user from the bot blacklist (guild-only).',
      usage: 'blacklist <add/remove> <user ID> <reason>',
      adminOnly: true,
      botPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS']
    });
    this.blStatus = {
      true: 'True',
      false: 'False'
    };
  }

  async run(message, args, settings) {

    const { embedColor } = this.client.config;
    const { name } = this.help;

    await message.delete().catch(O_o=>{});

    let gBlacklists;
    try {
      gBlacklists = await this.client.blacklists.getGuildBlacklist(message.guild);
    } catch (err) {
      this.client.logger.error(err.stack);
      return message.channel.send(`An error occurred: **${err.message}**`);
    }

    const caseNum = gBlacklists.length + 1;
    const blEmbed = new RichEmbed().setTimestamp();

    if (!args[0]) {

      let active = 0;
      gBlacklists.forEach(blacklist => {
        if (blacklist.status === false) return;
        const issued = this.client.users.get(blacklist.userID);
        const issuer = this.client.users.get(blacklist.issuerID);
        const num = blacklist.case;
        const reason = blacklist.reason;
        const caseStatus = this.blStatus[blacklist.status];

        blEmbed.addField(`Case #${num}`, `**User:** ${issued.tag}\n**Reason:** ${reason}\n**Issuer:** ${issuer.tag}\n**Status:** ${caseStatus}`);
        active++;
      });

      blEmbed.setTitle(`${this.client.user.username} | Blacklisted User`);
      blEmbed.setDescription(`
        These users are currently blacklisted from using any of the bot commands in this guild. Use \`${settings.prefix + name} help\` for command information.
      `);
      blEmbed.setColor(embedColor);

      if (gBlacklists.length === 0) {
        return message.channel.send(`There are no blacklisted users! Use \`${settings.prefix + name} help\` for more information.`)
          .then(m => m.delete(5000))
          .catch(e => this.client.logger.error(e.stack));
      }
      if (active === 0) {
        return message.channel.send(`There are currently no active blacklisted users. Use \`${settings.prefix + name} help\` for more information.`)
          .then(m => m.delete(5000))
          .catch(e => this.client.logger.error(e.stack));
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
      if (!reason) return message.channel.send('Please provide a reason!').then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err.stack));

      const newBlacklist = {
        guildID: message.guild.id,
        userID: blUser.id,
        reason: reason,
        issuerID: message.author.id,
        newTime: message.createdAt.getTime(),
        status: true,
        case: caseNum
      };

      blEmbed.setTitle(`${this.client.user.username} | Blacklisted User Added`);
      blEmbed.setColor('#00e640');
      blEmbed.addField('User', `${blUser} \`[${blUser.tag}]\``, true);
      blEmbed.addField('Reason', reason, true);
      blEmbed.addField('Issuer', `${message.author} \`[${message.author.id}]\``);


      const dmBlacklistAdd = new RichEmbed()
        .setDescription(`
                    Hello ${blUser},

                    You have been blacklisted by ${message.author} from using any of the ${this.client.user}'s commands in the guild **${message.guild}**.
                    
                    This blackist does not expire and can only be removed at the discretion of a server administrator. You may find the reason below.

                    **Reason:** ${reason}
                    `)
        .setColor('#00e640')
        .setTimestamp();

      try {
        await this.client.blacklists.addUserBlacklist(newBlacklist);
        message.channel.send(blEmbed).then(msg => msg.delete(5000));
        await blUser.send(dmBlacklistAdd);
      } catch (err) {
        this.client.logger.error(err.stack);
        if (err.code === 50007) {
          return message.channel.send(oneLine`
                            Bot blacklist has been issued. However, I could not DM **${blUser.tag}** because they either have DMs disabled
                            or aren't a member of this server.
                        `)
            .then(m => m.delete(5000));
        }
        message.channel.send(`There was an error adding this user to the blacklist: **${err.message}**.`);
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

      const dmBlacklistRemove = new RichEmbed()
        .setDescription(`
                    Hello ${blUser},

                    You have been unblacklisted by ${message.author}. This means you are now able to use the ${this.client.user}'s commands in the guild **${message.guild}**.

                    **Reason:** ${reason ? reason : 'None provided'}
                    `)
        .setColor('#d64541')
        .setTimestamp();

      try {
        await this.client.blacklists.removeUserBlacklist(removeBlacklist);
        message.channel.send(blEmbed).then(msg => msg.delete(5000));
        await blUser.send(dmBlacklistRemove);
      } catch (err) {
        this.client.logger.error(err.stack);
        if (err.code === 50007) {
          return message.channel.send(oneLine`
                            Bot blacklist removal has been issued. However, I could not DM **${blUser.tag}** because they either have DMs disabled
                            or aren't a member of this server.
                        `)
            .then(m => m.delete(5000));
        }
        message.channel.send(`There was an error adding this user to the blacklist: **${err.message}**.`);
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
