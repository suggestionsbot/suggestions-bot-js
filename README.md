# Suggestions
The "Suggestions" bot is a simple and easy to use, but extensive bot, that's built to be the only tool for suggestions you need in your Discord server.

Getting the bot up and running is very simple. All you have to do is set a suggestions channel, logs channel and add some staff roles. Run these two commands with the channels you want. Make sure they have the `ADD_REACTIONS` and `SEND_MESSAGES` permissions in both of those channels before proceeding. 
```
,setchannel <channel>
,setlogs <channel>
```
Once that's set up, users can begin submitting suggestions! For approving/rejecting suggestions, just visit the "Suggestion Management" section below.

Adding a new suggestion is simple. Use `,suggest <suggestion>` to type out your suggestion. Once submitted, the suggestion will be posted in a `#suggestions` channel (or the channel you set above) by default on your server where users will then be able to vote via reactions (read below to set custom channels).

If you need to check the current bot prefix, simply mention the bot or mention the bot with the `prefix` command. Examples:
```
@Suggestions#2602 
@Suggestions#2602 prefix
```
You should get a response similar to this:
```
[2:44 PM] BOT Suggestions: My prefix in this guild is ,
```

#### Suggested Usage
With the setup above, it's recommended to disable the `SEND_MESSAGES` and `ADD_REACTIONS` permissions for `@everyone` and give those explicit permissions to the bot. In this case, the suggestions and logs channel may be kept clean and only the vote reactions can be used.

#### Suggestion Management
Allow staff members in your Discord to manage suggestions via approving and rejecting them via specific roles. Simply add some roles using `,role add <role>` and from there, suggestions can be managed.

*By default, users with the `MANAGE_GUILD` permission can manage suggestions.*

#### Staff Suggestions
Allow zero interference with user suggestions allowing staff members to suggest and vote on matter internally with no interruptions. Read more on about this via our [Staff Suggestions](https://docs.thenerdcave.us/staff-suggestions)'s page in the documentation.

#### Custom Configuration
Server owners can change the default prefix and suggestions channel of the Suggestions along with a wider range of configuration. Here are a few:

- `,setprefix <prefix>` allows you to the change the bot's prefix
- `,setchannel <channel>` allows you to change the suggestions channel
- `,setlogs <channel>` allows you to set the channel where suggestions will be logged after approval/rejection
- `,setvotes <id>` allows you to set the default emoji set used for voting (these are added as reactions to the suggestion)

*User must have the `MANAGE_GUILD` permission to change these settings*

#### Suggestions Features, Reporting Bugs and Receiving Support
If there is ever an error or bug or you wish to suggest something new to the bot, then you may join our Support Discord (just click [here](https://discord.gg/g7wr8xb)!). Follow the single super-easy step once you join and then head over to the `#support` channel if you need help, `#bug_reports` if found a bug or simply discuss and post a suggestion the same way you would submit a new suggestion as described above!

#### Future Features
- Add your own reactions?
- Leave suggestions in the Support Discord

*You can also mention the bot in place of the prefix to use commands!*
  Read the website for more information and unlock the full usage of the bot! [https://docs.thenerdcave.us/](https://docs.thenerdcave.us/)