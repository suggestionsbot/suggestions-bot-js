module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(messageReaction, user) {

        const message = messageReaction.message;
        const guild = message.guild;
        const member = guild.members.get(user.id);
        if (member.user.bot) return;

        let settings;
        try {
            settings = await this.client.settings.getGuild(guild);
            // We need to load the user reactions into cache if not available yet
            if (messageReaction.users.size < 1) await messageReaction.fetchUsers();
        } catch (err) {
            return this.client.logger.error(err.stack);
        }

        let sChannel = message.guild.channels.find(c => c.name === settings.suggestionsChannel) ||
            message.guild.channels.find(c => c.toString() === settings.suggestionsChannel) ||
            message.guild.channels.get(settings.suggestionsChannel);
        if (!sChannel || message.channel.id !== sChannel.id) return;

        const reactions = message.reactions.map(r => {
            return r.users.filter(u => u.id === member.id).size;
        });

        const reactionCount = reactions.reduce((acc, cur) => acc + cur);
        if (reactionCount > 1) return await messageReaction.remove(member.id);
    }
};