import { DiscordCommandError } from './discord-command-error';

export class UnbannableUserError extends DiscordCommandError {
  constructor() {
    super();
    this.name = 'UnbannableUserError';
    this.message =
      "I cannot ban this user. Make sure my role is above the user's role.";
  }
}
