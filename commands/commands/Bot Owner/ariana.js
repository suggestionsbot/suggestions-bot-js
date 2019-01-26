const Command = require('../../Command');

module.exports = class ArianaCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ariana',
            category: 'Owner',
            description: 'Much to Ariana Grande <3',
            ownerOnly: true
        });
    }

    async run(message, args) {

        const { giphyKey } = this.client.config;

        const giphy = require('giphy-api')(giphyKey);
        const query = 'ariana grande';
        
        try {
            const ariana = await giphy.random(query);
            const data = ariana.data;
            const image = data.images.original.url;
            
            message.channel.send({ embed: {
                color: 0xCCCCFF,
                image: { url: image }
            } });
        } catch (err) {
            this.client.logger.error(err.stack);
            return message.channel.send(`Error searching **${query}** on Giphy: **${err.message}**`);
        }
        

        return;
    }
};