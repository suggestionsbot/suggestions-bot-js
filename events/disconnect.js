module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run() {
        this.client.logger.log('Bot is disconnecting...');
    }
};