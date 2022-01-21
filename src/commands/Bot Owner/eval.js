const { MessageEmbed } = require('discord.js-light');
const hastebin = require('hastebin-gen');
const Command = require('../../structures/Command');
const { messageDelete } = require('../../utils/functions');

module.exports = class EvalCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'eval',
      category: 'Bot Owner',
      description: 'Run raw Javascript code via the bot.',
      usage: 'eval <code>',
      ownerOnly: true,
      guildOnly: false
    });
  }

  async run(message, args, settings) {

    const { embedColor, suggestionColors: { rejected } } = this.client.config;

    const code = args.join(' ');
    if (!code) return this.client.errors.noUsage(message.channel, this, settings);

    const embed = new MessageEmbed().setFooter({ text: `ID: ${message.author.id}` });
    const exceededEmbed = new MessageEmbed(embed);

    try {
      const evaled = eval(code);
      const clean = await this.client.clean(evaled);

      // 6 graves, and 2 characters for "js"
      const MAX_CHARS = 3 + 2 + clean.length + 3;
      if (MAX_CHARS > 1000) {
        const haste = await hastebin(Buffer.from(clean), {
          url: 'https://paste.thenerdcave.us',
          extension: 'js'
        });
        message.author.send(`<${haste}>`);

        exceededEmbed.setColor(embedColor);
        exceededEmbed.setDescription('📨 Output exceeded 1000 characters. DMing you the Hastebin.');

        const msg = await message.channel.send({ embeds: [exceededEmbed] });
        await msg.react('📧');
        await messageDelete(msg, 2500);
        return;
      }

      embed.setColor(embedColor);
      embed.addField('Input 📥', `\`\`\`js\n${code}\`\`\``);
      embed.addField('Output 📤', `\`\`\`js\n${clean}\`\`\``);
    } catch (err) {
      if (err.length > 2000) {
        const haste = await hastebin(Buffer.from(err), {
          url: 'https://paste.thenerdcave.us',
          extension: 'js'
        });
        message.author.send(`<${haste}>`);

        exceededEmbed.setColor(rejected);
        exceededEmbed.setDescription('📨 Output exceeded 2000 characters. DMing you the Hastebin.');

        const msg = await message.channel.send({ embeds: [exceededEmbed] });
        await msg.react('📧');
        await messageDelete(msg, 5000);
        return;
      }

      embed.setColor(rejected);
      embed.addField('Error ❗', `\`\`\`bash\n${err}\`\`\``);
    }

    if (!code.startsWith('void')) return message.channel.send({ embeds: [embed] });
  }
};
