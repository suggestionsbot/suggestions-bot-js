const chalk = require('chalk');
const { inspect } = require('util');

class Logger {
  static _formMessage(...body) {
    const data = [];

    for (const m of body) {
      if (typeof m === 'object') data.push(inspect(m));
      else data.push(m);
    }

    return data.join(' ');
  }

  static log(...body) {
    console.log(`${chalk.bold.white('[ LOG ] ') + Logger._formMessage(...body)}`);
  }

  static success(title, ...body) {
    console.log(`${chalk.bold.green(`[ SUCCESS ] [ ${title} ]`) + Logger._formMessage(...body)}`);
  }

  static warning(title, ...body) {
    console.warn(`${chalk.bold.yellow(`[ WARNING ] [ ${title} ]`) + Logger._formMessage(...body)}`);
  }

  static error(title, ...body) {
    console.error(
      `${chalk.bold.red(title ? `[ ERROR ] [ ${title} ]` : '[ ERROR ] ') + Logger._formMessage(...body)}`
    );
  }

  static errorCmd(command, ...body) {
    console.error(
      `${chalk.bold.red(`[ CMD:${command.help.name} ]`) + Logger._formMessage(...body)}`
    );
  }

  static debug(title, ...body) {
    console.debug(`${chalk.bold.magenta(`[ DEBUG ] [ ${title} ]`) + Logger._formMessage(...body)}`);
  }

  static event(event, ...body) {
    console.log(`${chalk.bold.yellow(`[ EVENT ] [ ${event.toUpperCase()} ]`) + Logger._formMessage(...body)}`);
  }

  static command(command, ...body) {
    console.log(`${chalk.bold.green(`[ COMMAND ] [ ${command.toUpperCase()} ]`) + Logger._formMessage(...body)}`);
  }

  static ready(...body) {
    console.log(`${chalk.bold.green('[ READY ] ') + Logger._formMessage(...body)}`);
  }
}

module.exports = Logger;
