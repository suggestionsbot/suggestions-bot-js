const { version } = require('../package.json');
const { botPresence } = require('../utils/utils');

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
    }
};