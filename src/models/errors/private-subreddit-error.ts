import { DiscordCommandError } from './discord-command-error';

export class PrivateSubredditError extends DiscordCommandError {
  constructor() {
    super();
    this.name = 'PrivateSubredditError';
    this.message = 'It looks like this community is private.';
  }
}
