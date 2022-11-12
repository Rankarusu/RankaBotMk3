import { DiscordCommandError } from './discord-command-error';

export class InvalidInputError extends DiscordCommandError {
  constructor() {
    super();
    this.name = 'InvalidInputError';
    this.message = `There seems to be an error in your input. Please try again. 
      You may refer to the \`/help\` command for examples of working input `;
  }
}
