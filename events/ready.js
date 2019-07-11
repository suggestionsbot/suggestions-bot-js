const { RichEmbed } = require('discord.js');
const { version } = require('../package.json');
require('dotenv-flow').config();

const versions = {
  production: 'Production',
  development: 'Development'
};

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run() {
    await this.client.wait(1000);

    this.client.appInfo = await this.client.fetchApplication();
    setInterval(async () => {
      this.client.appInfo = await this.client.fetchApplication();
    }, 60000);

    const guildCount = await this.client.shard.fetchClientValues('guilds.size')
      .then(res => res.reduce((prev, count) => prev + count, 0));

    await this.client.logger.log(`Version ${version} of the bot loaded.`);
    await this.client.logger.log(`${versions[process.env.NODE_ENV]} version of the bot loaded.`);
    this.client.mongoose.init(); // initialize connection to the database
    await this.client.logger.log(`Logged in as ${this.client.user.tag} (${this.client.user.id}) in ${guildCount} server(s) on shard ${this.client.shard.id}.`, 'ready');

    this.client.botPresence();

    // this.client.shard.broadcastEval(`
    //   if (this.shard.id === 0) this.dashboard.app.listen(process.env.API_PORT);
    // `);

    // If the bot was invited to a guild while it was offline, the "ready" event will
    // be emitted (ONLY IN PRODUCTION)
    if (process.env.NODE_ENV === 'production') {

      // handle posting stats to bot lists
      require('../utils/voting')(this.client);

      try {
        await this.client.shard.broadcastEval(`
          (() => {
            try {
              this.guilds.forEach(async g => {
                const { guildID } = await this.settings.getGuild(g);
                if (!guildID) this.emit('guildCreate', g);
              });
            } catch (err) {
              this.logger.error(err.stack);
            }
          })();
        `);

      } catch (error) {
        this.client.logger.error(error.stack);
      }

      // let allSettings;
      // try {
      //   allSettings = await this.client.settings.getAllSettings();
      // } catch (err) {
      //   this.client.logger.error(err.stack);
      // }

      // allSettings.map(async e => {
      //   const g = this.client.guilds.get(e.guildID);
      //   if (!g) {
      //     try {
      //       await this.client.settings.deleteGuild(e);
      //     } catch (err) {
      //       this.client.logger.error(err);
      //     }

      //     const oldServer = new RichEmbed()
      //       .setTitle('Removed')
      //       .setDescription(`
      //                   **ID:** \`${e.guildID}\`
      //                   **Name:** \`${e.guildName}\`
      //                   **Owner:** <@${e.guildOwnerID}>
      //                   `)
      //       .setColor('#FF4500')
      //       .setTimestamp();

      //     switch (process.env.NODE_ENV) {
      //     // 345753533141876737 = Nerd Cave Testing
      //     case 'development': {
      //       const logGuild = this.client.guilds.get('345753533141876737');
      //       const logChannel = logGuild.channels.find(c => c.name === 'server_logs');
      //       logChannel.send(oldServer);
      //       break;
      //     }
      //     // 480231440932667393 = Nerd Cave Development
      //     default: {
      //       const logGuild = this.client.guilds.get('480231440932667393');
      //       const logChannel = logGuild.channels.find(c => c.name === 'server_logs');
      //       logChannel.send(oldServer);
      //       break;
      //     }
      //     }
      //   }
      // });
    }
  }
};
