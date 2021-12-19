const Command = require('../../structures/Command');
const { noBotPerms } = require('../../utils/errors');
const Logger = require('../../utils/logger');

module.exports = class ReloadCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'reload',
      category: 'Bot Owner',
      description: 'Reload a bot command.',
      usage: 'reload <command>',
      ownerOnly: true,
      guildOnly: false,
      botPermissions: ['MANAGE_MESSAGES']
    });
  }

  async run(message, args, settings) {

    if (this.client.production) {
      return message.channel.send('This command can only be used in a development environment!')
        .then(msg => msg.delete({ timeout: 5000 }))
        .catch(err => Logger.errorCmd(this, err.stack));
    }

    const perms = message.guild.me.permissions;
    if (!perms.has('MANAGE_MESSAGES')) return noBotPerms(message, 'MANAGE_MESSAGES');

    message.delete().catch(O_o => {});

    if (!args[0]) return this.client.errors.noUsage(message.channel, this, settings);

    const cmd = this.client.commands.get(args[0]) || this.client.commands.get(this.client.aliases.get(args[0]));
    if (!cmd) return message.channel.send(`The command \`${args[0]}\` does not exist.`).then(msg => msg.delete({ timeout: 5000 })).catch(err => Logger.errorCmd(this, err.stack));

    let response = await this.client.commandHandler.unloadCommand(cmd.conf.location, cmd.help.name);
    if (response) {
      Logger.errorCmd(this, response);
      return message.channel.send(`An error occurred unloading \`${cmd.help.name}]\`: **${response}**`);
    }

    response = this.client.commandHandler.loadCommand(cmd.conf.location, cmd.help.name);
    if (response) {
      Logger.errorCmd(this, response);
      return message.channel.send(`An error occurred loading \`${cmd.help.name}]\`: **${response}**`);
    }

    return message.channel.send(`The command \`${cmd.help.name}\` has been reloaded.`);
  }
};
