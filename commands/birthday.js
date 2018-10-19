const { owner, embedColor } = require('../config');
const { RichEmbed } = require('discord.js');

exports.run = async (client, message, args) => {

	let embed = new RichEmbed()
		.setDescription(`Its <@${owner}>'s birthday! (born on October 19, 1998 somewhere around 6AM.)`)
		.setColor(embedColor);

	message.channel.send(embed).then(msg => msg.delete(5000)).catch(console.error);

};

exports.help = {
	name: 'birthday',
	aliases: ['bday'],
	description: 'It\'s Anthony\'s birthday!',
	usage: 'birthday'
};