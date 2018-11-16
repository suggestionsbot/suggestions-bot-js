const { RichEmbed } = require('discord.js');
const Settings = require('../models/settings');
const Suggestion = require('../models/suggestions');
const Command = require('../models/commands');
const { version } = require('../package.json');
const { botPresence } = require('../utils/utils');
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

        await this.client.logger.log(`Logged in as ${this.client.user.tag} (${this.client.user.id}) in ${this.client.guilds.size} server(s).`);
        await this.client.logger.log(`Version ${version} of the bot loaded.`);
        await this.client.logger.log(`${versions[process.env.NODE_ENV]} version of the bot loaded.`);

        botPresence(this.client);

    // If the bot was invited to a guild while it was offline, the "ready" event will
    // be emitted (ONLY IN PRODUCTION)
    if (process.env.NODE_ENV === 'production') {
        this.client.guilds.forEach(async g => {
            let gSettings = await Settings.findOne({ guildID: g.id }).catch(err=> this.client.logger.error(err));
            
            if (!gSettings && g) await this.client.emit('guildCreate', g);

            // if there's a new guild owner, update the database upon the ready event
            if (gSettings.guildOwnerID !== g.ownerID) await this.client.writeSettings(g.id, { guildOwnerID: g.ownerID }).catch(err => this.client.logger.error(err));
            
        });

        // Need to figure out a more efficient way of doing this I feel. Emitting the
        // "guildDelete" event doesn't seem the best way to do things because the guild
        // doesn't actually exist!
        let gSettings = await Settings.find({}).catch(err=> this.client.logger.error(err));
        gSettings.map(async e => {
            let g = this.client.guilds.get(e.guildID);
            if (!g) {
                await Settings.findOneAndDelete({ guildID: e.guildID }, err => {
                    if (err) this.client.logger.error(err);
                    
                    this.client.logger.log(`Settings data deleted for guild ${e.guildName} (${e.guildID})`);
                });
            
                await Suggestion.deleteMany({ guildID: e.guildID }, err => {
                    if (err) this.client.logger.error(err);
            
                    this.client.logger.log(`Suggestions data deleted for guild ${e.guildName} (${e.guildID})`);
                });
            
                await Command.deleteMany({ guildID: e.guildID }, err => {
                    if (err) this.client.logger.error(err);
            
                    this.client.logger.log(`Command data deleted for guild ${e.guildName} (${e.guildID})`);
            
                });

                this.client.logger.log(`${this.client.user.username} has left a guild (bot was offline): ${e.guildName} (${e.guildID})`);

                botPresence(this.client);

                let oldServer = new RichEmbed()
                    .setTitle('Removed')
                    .setDescription(`
                        **ID:** \`${e.guildID}\`
                        **Name:** \`${e.guildName}\`
                        **Owner:** <@${e.guildOwnerID}>
                    `)
                    .setColor('#FF4500')
                    .setTimestamp();

                switch (process.env.NODE_ENV) {
                    // 345753533141876737 = Nerd Cave Testing
                    case 'development': {
                        const logGuild = this.client.guilds.get('345753533141876737');
                        const logChannel = logGuild.channels.find(c => c.name === 'server_logs');
                        logChannel.send(oldServer);
                        break;
                    }
                    // 480231440932667393 = Nerd Cave Development
                    default: {
                        const logGuild = this.client.guilds.get('480231440932667393');
                        const logChannel = logGuild.channels.find(c => c.name === 'server_logs');
                        logChannel.send(oldServer);
                        break;
                    }
                }
            }
        });
    }
    }
};