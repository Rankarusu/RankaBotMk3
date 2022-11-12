import { DiscordCommandError } from './discord-command-error';

export class UserNotBannedError extends DiscordCommandError {
  constructor() {
    super();
    this.name = 'UserNotBannedError';
    this.message = 'There is no user banned with that id';
  }
}
