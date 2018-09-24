const Discord = require('discord.js');
const fs = require('fs');
const moment = require('moment');
const { owner, prefix, orange } = require('../config.json');
let blConfig = JSON.parse(fs.readFileSync('./blacklisted.json', 'utf8'));

exports.run = async (client, message, args) => {

    // Need to properly sync blacklist file changes in cache?

    if (message.author.id !== owner) return;

    await message.delete().catch(O_o=>{});

    let cmdName = client.commands.get('blacklist', 'help.name');

    let blEmbed = new Discord.RichEmbed()
        .setFooter(`ID: ${message.author.id}`)
        .setTimestamp();

    // If no argument is provided as well as define arguments
    let num = 1;
    if (!args[0]) {

        if (blConfig.cases.length === 0) return message.channel.send('There are no blacklisted users!').then(msg => msg.delete(5000)).catch(console.error);

        for (let i = 0; i < blConfig.cases.length; i++) {
            try {
                let caseNum = num++;
                let caseID = blConfig.cases[i].id;
                let caseReason = blConfig.cases[i].reason;
                let caseIssuer = blConfig.cases[i].issuer;
                blEmbed.addField(`Case #${caseNum}`, `**ID:** ${caseID}\n **Reason:** ${caseReason}\n **Issued By:** ${caseIssuer}`);
            } catch (err) {
                break;
            }
        }
        
        await blEmbed.setTitle(`${client.user.username} | Blacklisted User`);
        await blEmbed.setDescription(`These users are blacklisted from using any of the bot commands. Use \`${prefix + cmdName} help\` for command information.`);
        await blEmbed.setColor(orange);
        return message.channel.send(blEmbed);
    }

    if (args[0] === 'help') return message.channel.send(`Usage: \`${prefix + cmdName} <add/remove> <user ID> <reason>\``).then(msg => msg.delete(5000).catch(console.error));
    
    let blacklisted = args[1];
    let reason = args.slice(2).join(' ');
    const userIDCheck = /^\d+$/;
    if (!userIDCheck.test(blacklisted)) return message.channel.send('You must supply a user ID.').then(msg => msg.delete(3000)).catch(console.error);
    const blUser = blacklisted.match(userIDCheck)[0];

    switch (args[0]) {
        case 'add':
            if (!reason) return message.channel.send('Please provide a reason!').then(msg => msg.delete(5000)).catch(console.error);
            
            blConfig.cases.push({
                id: blUser,
                reason: reason,
                issuer: `${message.member.user.tag} (${message.author.id})`
            });

            fs.writeFile('./blacklisted.json', JSON.stringify(blConfig, null, 2), async (err) => {
                if (err) {
                    console.log(err);
                    return message.channel.send('There was an error adding this user to the blacklist!');
                }

                await delete require.cache[require.resolve('../blacklisted.json')];

                console.log(`${message.member.user.tag} ("${message.author.id}" has has issued a blacklist to the user ID ${blUser}. [${moment(message.createdAt)}]`);

                await blEmbed.setTitle(`${client.user.username} | Blacklisted User Added`);
                await blEmbed.setColor('#00e640');
                await blEmbed.addField('ID', blUser, true);
                await blEmbed.addField('Reason', reason, true);
                await blEmbed.addField('Issued By', `${message.member.user.tag} (${message.author.id})`);

                await message.channel.send(blEmbed).then(msg => msg.delete(5000)).catch(console.error);
            });

            break;
        case 'remove':
            blConfig.cases = blConfig.cases.filter(user => { return user.id !== blUser; });

            fs.writeFile('./blacklisted.json', JSON.stringify(blConfig, null, 2), async (err) => {
                if (err) {
                    console.log(err);
                    return message.channel.send('There was an error removing this user from the blacklist!');
                }

                await delete require.cache[require.resolve('../blacklisted.json')];
                
                console.log(`${message.member.user.tag} ("${message.author.id}") has issued a unblacklist for the user ID ${blUser}.`);

                
                await blEmbed.setTitle(`${client.user.username} | Blacklisted User Removed`);
                await blEmbed.setColor('#d64541');
                await blEmbed.addField('ID', blUser, true);

                await message.channel.send(blEmbed).then(msg => msg.delete(5000)).catch(console.error);
            });
            
            

            break;
    }
};

exports.conf = {
    aliases: []
};

exports.help = {
    name: "blacklist",
    description: "Add or remove a user from the bot blacklist",
    usage: "blacklist <add/remove> <user ID>"
};