import { DiscordCommandWarning } from './discord-command-warning';

export class CommandOnCooldownWarning extends DiscordCommandWarning {
  constructor() {
    super();
    this.name = 'CommandOnCooldownWarning';
    this.message = 'Chill.';
  }
}
