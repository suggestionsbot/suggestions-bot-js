# Suggestions Bot
The Suggestions Bot is a simple bot. It handles the creation of new suggestions that are pushed into a `#suggestions` channel on the guild. From there, users can react with a `✅` to agree with a suggestion or a `❌` to disagree with a suggestions. Suggestions can be removed by the suggestion author or the bot owner (soon to be updated to those who have the `MANAGE_MESSAGES` permission).

## Requirements

- `git` command line ([Windows](https://git-scm.com/download/win)|[Linux](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)|[MacOS](https://git-scm.com/download/mac)) installed
- `node` [Version 8.0.0 or higher](https://nodejs.org)

You also need your bot's token. This is obtained by creating an application in
the Developer section of discordapp.com. Check the [first section of this page](https://anidiots.guide/getting-started/the-long-version.html) 
for more info.

## Downloading

In a command prompt in your projects folder (wherever that may be) run the following:

`git clone https://bitbucket.com/xSinclare/suggestions-bot.git`

Once finished: 

- In the folder from where you ran the git command, run `cd nerd-suggestions` and then run `npm install`
- Edit the `config.json` to your like (you MUST update `owner` and `token` to your user ID and bot token)
- Edit `config.js` and fill in all the relevant details as indicated in the file's comments.

## Starting the bot

To start the bot, in the command prompt, run the following command:
`node app.js`

## Inviting to a guild

To add the bot to your guild, you have to get an oauth link for it. 

You can use this site to help you generate a full OAuth Link, which includes a calculator for the permissions:
[https://finitereality.github.io/permissions-calculator/?v=0](https://finitereality.github.io/permissions-calculator/?v=0)