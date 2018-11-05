module.exports = class Command {
    constructor(client, {
        name = null,
        description = null,
        category = null,
        usage = null,
        enabled = true,
        guildOnly = false,
        adminOnly = false,
        ownerOnly = false,
        aliases = new Array()
    }) {
        this.client = client;
        this.conf = { enabled, guildOnly, adminOnly, ownerOnly, aliases };
        this.help = { name, description, category, usage };
    }
};