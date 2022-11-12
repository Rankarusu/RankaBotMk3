import { DiscordCommandError } from './discord-command-error';

export class APICommunicationError extends DiscordCommandError {
  constructor() {
    super();
    this.name = 'APICommunicationError';
    this.message = 'An Error occurred while communicating with the API';
  }
}
