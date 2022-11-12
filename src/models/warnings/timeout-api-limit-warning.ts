import { DiscordCommandWarning } from './discord-command-warning';

export class TimeoutAPILimitWarning extends DiscordCommandWarning {
  constructor() {
    super();
    this.name = 'TimeoutAPILimitWarning';
    this.message = 'The Discord API limits timeouts to 4 weeks.';
  }
}
