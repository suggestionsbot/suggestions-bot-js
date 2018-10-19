const { owner } = require('../config');

exports.run = async (client, message, args) => {

	message.channel.send(`Its <@${owner}>'s birthday! (born on October 19, 1998 somewhere around 6AM.`).then(msg => msg.delete(5000)).catch(console.error);

};

exports.help = {
	name: 'birthday',
	aliases: ['bday'],
	description: 'It\'s Anthony\'s birthday!',
	usage: 'birthday'
};