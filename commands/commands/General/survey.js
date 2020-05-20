const { stripIndents } = require('common-tags');
const Command = require('../../Command');

module.exports = class SurveyCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'survey',
      category: 'General',
      description: 'Take the 2020 Suggestions bot survey.',
      guildOnly: false,
      guarded: true
    });
  }

  async run(message, args) {
    const { discord, surveyURL } = this.client.config;

    message.channel.send(stripIndents`We are running a survey to help better shape the future of the ${this.client.user}. You can fill out the **Google Form** at <${surveyURL}> to provide your feedback.
    
      Please be honest in your survey and don't try and change things up for a better chance at winning because it'll be **completely random**.
      
      If you have any more questions or looking for more information, please check out the ${message.guild.id === '601219766258106399' ? '<#601219766258106399>' : '**announcements**'} channel
      over in our **Official Discord**: <${discord}>.
      
      Thank you for being a supporter of this bot!
    `);
  }
};
