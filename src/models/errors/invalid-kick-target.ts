import { DiscordCommandError } from './discord-command-error';

export class InvalidKickTargetError extends DiscordCommandError {
  constructor() {
    super();
    this.name = 'InvalidKickTargetError';
    this.message = 'You cannot kick this user.';
  }
}
