import { DiscordCommandError } from './discord-command-error';

export class MessageDeleteError extends DiscordCommandError {
  constructor() {
    super();
    this.name = 'MessageDeleteError';
    this.message = 'An error ocurred while deleting messages.';
  }
}
