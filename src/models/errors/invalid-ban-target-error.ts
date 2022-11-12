import { DiscordCommandError } from './discord-command-error';

export class InvalidBanTargetError extends DiscordCommandError {
  constructor() {
    super();
    this.name = 'InvalidBanTargetError';
    this.message = 'You cannot ban this user.';
  }
}
