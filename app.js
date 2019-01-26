if (Number(process.version.slice(1).split(".")[0]) < 8) throw new Error("Node 8.0.0 or higher is required. Update Node on your system.");

const { oneLine } = require('common-tags');
const Suggestions = require('./client');

require('dotenv-flow').config();

const client = new Suggestions();

(async () => {
    client.commandHandler.init();
    await client.eventHandler.init();
    client.mongoose.init(); // initialize connection to the database
    client.login();
})();

client.on('disconnect', () => client.logger.warn('Bot is disconnecting...'));
client.on('reconnecting', () => client.logger.log('Bot reconnecting...', 'log'));
client.on('commandBlocked', (cmd, reason) => {
    client.logger.warn(oneLine `
            Command ${cmd ? `${cmd.help.category}:${cmd.help.name}` : ''}
            blocked; ${reason}
        `);
});
client.on('userBlacklisted', (user, guild, cmd, global = false) => {
    if (global) {
        client.logger.warn(oneLine `
            User "${user ? `${user.tag} (${user.id})` : ''}"
             in the 
            Guild "${guild ? `${guild.name} (${guild.id})` : ''}"
             tried to use the
            Command "${cmd ? `${cmd.help.category}:${cmd.help.name}` : ''}",
             but is blacklisted from using bot commands globally.
        `);
    } else {
        client.logger.warn(oneLine `
            User "${user ? `${user.tag} (${user.id})` : ''}"
             in the 
            Guild "${guild ? `${guild.name} (${guild.id})` : ''}"
             tried to use the
            Command "${cmd ? `${cmd.help.category}:${cmd.help.name}` : ''}",
             but is blacklisted from using bot commands in the guild.
        `);
    }
});

/* MISCELLANEOUS NON-CRITICAL FUNCTIONS */

// EXTENDING NATIVE TYPES IS BAD PRACTICE. Why? Because if JavaScript adds this
// later, this conflicts with native code. Also, if some other lib you use does
// this, a conflict also occurs. KNOWING THIS however, the following methods
// are, we feel, very useful in code. 

// These 2 process methods will catch exceptions and give *more details* about the error and stack trace.
process.on('uncaughtException', (err) => {
    const msg = err.stack.replace(new RegExp(`${__dirname}/`, 'g'), './');
    client.logger.error(`Uncaught Exception: \n ${msg}`);
    // Always best practice to let the code crash on uncaught exceptions. 
    // Because you should be catching them anyway.
  process.exit(1);
});

process.on('unhandledRejection', err => {
    let msg = err.stack.replace(new RegExp(`${__dirname}/`, 'g'), './');
	client.logger.error(`Unhandled Rejection: \n ${msg}`);
});

process.on('SIGTERM', async () => {
    await client.logger.log('SIGTERM signal received.');
    await client.logger.log('Bot shutting down...');
    await client.destroy(() => {
        client.logger.log('Bot has shut down.');
        process.exit(0);
    });
});

// <String>.toPropercase() returns a proper-cased string such as: 
// "Mary had a little lamb".toProperCase() returns "Mary Had A Little Lamb"
String.prototype.toProperCase = function () {
    return this.replace(/([^\W_]+[^\s-]*) */g, function (txt) {return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

// // <Array>.random() returns a single random element from an array
// // [1, 2, 3, 4, 5].random() can return 1, 2, 3, 4 or 5.
Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)];
};