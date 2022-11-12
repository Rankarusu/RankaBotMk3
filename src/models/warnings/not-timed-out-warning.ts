import { DiscordCommandWarning } from './discord-command-warning';

export class NotTimedOutWarning extends DiscordCommandWarning {
  constructor() {
    super();
    this.name = 'NotTimedOutWarning';
    this.message = 'This user is not timed out.';
  }
}
