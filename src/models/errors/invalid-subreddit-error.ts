import { DiscordCommandError } from './discord-command-error';

export class InvalidSubredditError extends DiscordCommandError {
  constructor() {
    super();
    this.name = 'InvalidSubredditError';
    this.message = 'That is not a valid subreddit name.';
  }
}
