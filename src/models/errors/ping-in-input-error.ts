import { DiscordCommandError } from './discord-command-error';

export class PingInInputError extends DiscordCommandError {
  constructor() {
    super();
    this.name = 'PingInInputError';
    this.message = 'Termi was banned for that. Do you want to follow him?';
  }
}
