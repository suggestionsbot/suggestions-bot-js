const { RichEmbed } = require('discord.js');
const { oneLine } = require('common-tags');
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
      true: 'True',
      false: 'False'
    };
  }

  async run(message, args, settings) {

    const { embedColor } = this.client.config;
    const { prefix } = settings;
    const { name } = this.help;

    message.delete().catch(O_o=>{});

    let gBlacklists;
    try {
      gBlacklists = await this.client.blacklists.getGlobalBlacklists();
    } catch (err) {
      this.client.logger.error(err.stack);
      return message.channel.send(`An error occurred: **${err.message}**`);
    }

    const caseNum = gBlacklists.length + 1;
    const blEmbed = new RichEmbed().setTimestamp();

    if (!args[0]) {

      try {
        await this.client.shard.broadcastEval(`
          const { RichEmbed } = require('discord.js');
          const { embedColor } = this.config;

          const blStatus = {
            true: 'Active',
            false: 'Inactive'
          };

          (async () => {
            const senderMessage = await this.channels.get('${message.channel.id}')
              .fetchMessage('${message.id}');

            let gBlacklists;
            try {
              gBlacklists = await this.blacklists.getGlobalBlacklists();
            } catch (err) {
              this.logger.error(err.stack);
              return senderMessage.channel.send('An error occurred: **' + err.message + '**');
            }

            const caseNum = gBlacklists.length + 1;
            const blEmbed = new RichEmbed()
              .setColor(embedColor)
              .setFooter('Guild: ' + senderMessage.guild.id)
              .setTimestamp();

            const activeBlacklists = gBlacklists
              .filter(bl => (bl.status === true) && (bl.scope === 'global'));
            const blacklists = activeBlacklists.map(blacklist => {
              let time;
              const issued = this.users.get(blacklist.userID);
              const issuer = this.users.get(blacklist.issuerID);
              const num = blacklist.case;
              const reason = blacklist.reason;
              const caseStatus = blStatus[blacklist.status];
              if (blacklist.time && !blacklist.newTime) time = new Date(blacklist.time);
              if (!blacklist.time && blacklist.newTime) time = new Date(blacklist.newTime);

              const value = \`**User:** \` + issued.tag + \`
                **Reason:** \` + reason + \`
                **Issuer:** \` + issuer.tag + \`
                **Status:** \` + caseStatus + \`
                **Issued:** \` + time.toLocaleString() + \`
                \`;

              return {
                name: 'Case #' + num,
                value
              }
            });

            for (const blacklist of blacklists) blEmbed.addField(blacklist.name, blacklist.value);

            blEmbed.setAuthor(senderMessage.guild + '| Blacklisted Users', senderMessage.guild.iconURL)
            blEmbed.setDescription(\`
              These users are currently blacklisted from using any of the bot command's **globally**.
            
              Use \` + '\`${prefix + name} help\`' + ' for more information.'
            );

            // if (gBlacklists.length === 0) {
            //   return senderMessage.channel.send('There are no user blacklists! Use ' + '\`${prefix + name} help\`' + ' for more information.')
            //     .then(m => m.delete(5000));
            // }

            if (activeBlacklists.length < 1) {
              return senderMessage.channel.send(\`There are currently no active globally blacklisted users. Use \` + '\`${prefix + name} help\`' + ' for more information.');
            }

            return senderMessage.channel.send(blEmbed);
          })();
        `);
      } catch (err) {
        this.client.logger.error(err.stack);
        return message.channel.send(`An error occurred: **${err.message}**`);
      }

      return;
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
