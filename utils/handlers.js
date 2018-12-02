class ErrorHandler {
    constructor(name, message) {
        this.message = 'Could not retrieve guild information.';
        this.name = 'NoGuildSettings';
    }

    toString() {
        return this.name + ': "' + this.message + '"';
    }
}

const NoGuildSettings = new ErrorHandler('NoGuildSettings', 'Could not retrivew guild information from the database.');





module.exports = {
    NoGuildSettings
};