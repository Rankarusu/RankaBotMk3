import { DiscordCommandError } from './discord-command-error';

export class UnbanError extends DiscordCommandError {
  constructor() {
    super();
    this.name = 'UnbanError';
    this.message = 'Something went wrong while unbanning the user.';
  }
}
