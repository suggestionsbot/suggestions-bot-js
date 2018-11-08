const { Emoji, MessageReaction } = require('discord.js');

const events = {
    MESSAGE_REACTION_ADD: 'messageReactionAdd',
    MESSAGE_REACTION_REMOVE: 'messageReactionRemove'
};

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(event) {

        if (!events.hasOwnProperty(event.t)) return;

        const { d: data } = event;
        const user = this.client.users.get(data.user_id);
        const channel = this.client.channels.get(data.channel_id) || await user.createDM();

        if (channel.messages.has(data.message_id)) return;

        const message = await channel.fetchMessage(data.message_id);
        const emojiKey = data.emoji.id ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
        let reaction = message.reactions.get(emojiKey);

        if (!reaction) {
            const emoji = new Emoji(this.client.guilds.get(data.guild_id), data.emoji);
            reaction = new MessageReaction(message, emoji, 1, data.user_id === client.user.id); // eslint-disable-line
        }

        this.client.emit(events[event.t], reaction, user);

    }
};