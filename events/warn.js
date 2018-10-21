module.exports = (client, warn) => {
    client.logger.log(JSON.stringify(warn), 'warn');
};