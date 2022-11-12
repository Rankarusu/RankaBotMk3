import { DiscordCommandError } from './discord-command-error';

export class UnkickableUserError extends DiscordCommandError {
  constructor() {
    super();
    this.name = 'UnkickableUserError';
    this.message =
      "I cannot kick this user. Make sure my role is above the user's role.";
  }
}
