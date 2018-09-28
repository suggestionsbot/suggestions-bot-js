const Discord = require('discord.js');
const moment = require('moment');
const Settings = require('../models/settings.js');
const Suggestion = require('../models/suggestions.js');
const { noPerms, maintenanceMode, noSuggestionsPerms } = require('../utils/errors.js');
const { orange, owner } = require('../config.json');
require('moment-duration-format');
require('moment-timezone');

exports.run = async (client, message, args) => {

    const cmdName = client.commands.get('sid', 'help.name');

    let perms = message.guild.me.permissions;
    if (!perms.has('MANAGE_MESSAGES')) return message.channel.send('I can\'t delete messages! Make sure I have this permission: Manage Messages`').then(msg => msg.delete(5000));

    message.delete().catch(O_o=>{});

    let status = cmdStatus.get('status');
    if (status === 'off' && message.author.id !== owner)  return maintenanceMode(message.channel);


    Settings.findOne({
        guildID: message.guild.id,
    }, async (err, res) => {
        if (err) return console.log(err);

        const roles = res.staffRoles;

        const staffRoles = roles.map(el => {
            return message.guild.roles.find(r => r.name === el.role || r.id === el.role);
        });

        let admins = [];
        message.guild.members.forEach(collected => {
            
            if (collected.hasPermission('MANAGE_GUILD') && !collected.user.bot) return admins.push(collected.id);
            
        });

        if (!admins.includes(message.member.id) && !message.member.roles.some(r => staffRoles.includes(r))) return noSuggestionsPerms(message.channel);

        let id = args[0];
        if (!id) return message.channel.send(`Usage: \`${res.prefix + cmdName} <id>\``).then(msg => msg.delete(5000)).catch(console.error);

        Suggestion.findOne(
            { $and: [
                { guildID: message.guild.id },
                { sID: id },
            ]}
        ,async (err, res) => {

            if (res.length === 0) return message.channel.send('No suggestions data exists in this guild!').then(msg => msg.delete(3000)).catch(err => console.log(err));
            if (res.sID === null) return message.channel.send(`The sID **${id}** does not exist in the database.`).then(msg => msg.delete(3000)).catch(err => console.log(err));

            const submittedOn = moment(res.time).utc().format('MM/DD/YY @ h:mm A (z)');
            const updatedOn = moment(res.statusUpdated).utc().format('MM/DD/YY @ h:mm A (z)');
            let username = res.username;
            let userID = res.userID;
            let suggestion = res.suggestion;
            let updatedBy = res.staffMemberUsername;
            let results = res.results;

            let embed = new Discord.RichEmbed()
                .setAuthor(message.guild.name, message.guild.iconURL)
                .setTitle(`Info for sID ${id}`)
                .setFooter(`User ID: ${userID} | sID ${id}`);

            if (res.status === undefined) {
                await embed.setDescription(`
                **Submitter**
                ${username}
            
                **Suggestion**
                ${suggestion}
        
                **Submitted**
                ${submittedOn}`);
                await embed.setColor(orange);

                return message.channel.send(embed);
            }

            if (res.status === 'approved') {

                await embed.setDescription(`
                **Submitter**
                ${username}
    
                **Suggestion**
                ${suggestion}
    
                **Submitted**
                ${submittedOn}

                **Approved**
                ${updatedOn}

                **Approved By**
                ${updatedBy}

                **Results**
                ${results}
                
                `);
                await embed.setColor('#00e640');

                return message.channel.send(embed);
                
            }

            if (res.status === 'rejected') {
                await embed.setDescription(`
                **Submitter**
                ${username}
    
                **Suggestion**
                ${suggestion}
    
                **Submitted**
                ${submittedOn}

                **Rejected**
                ${updatedOn}

                **Rejected By**
                ${updatedBy}

                **Results**
                ${results}
                
                `);
                await embed.setColor('#cf000f');

                return message.channel.send(embed);
            }
        });

    });


};

exports.conf = {
    aliases: []
};

exports.help = {
    name: 'sid',
    description: 'View the information of a specific suggestion by their sID',
    usage: 'sid <id>'
};