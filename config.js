require('dotenv-flow').config();

module.exports = {
    dblToken: process.env.DBLTOKEN,
    db : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        name: process.env.DB_NAME
    },
    prefix: process.env.PREFIX,
    suggestionsChannel: process.env.SUGGESTIONSCHANNEL,
    suggestionsLogs: process.env.SUGGESTIONSLOGS,
    owner: process.env.OWNER,
    embedColor: process.env.DEFAULT_COLOR,
    discord: process.env.DISCORD,
    docs: process.env.DOCS,
    invite: process.env.INVITE,
    // dbURI: `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=admin`,
    // dbURILog: `mongodb://${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    suggestionColors: {
        approved: '#00e640',
        rejected: '#cf000f'
    }
};

module.exports.defaultSettings = {
    prefix: process.env.PREFIX,
    suggestionsChannel: process.env.SUGGESTIONSCHANNEL,
    suggestionsLogs: process.env.SUGGESTIONSLOGS
};