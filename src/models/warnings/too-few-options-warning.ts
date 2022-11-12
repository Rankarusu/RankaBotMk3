import { DiscordCommandWarning } from './discord-command-warning';

export class TooFewOptionsWarning extends DiscordCommandWarning {
  constructor() {
    super();
    this.name = 'TooFewOptionsWarning';
    this.message = 'Tough decision you got there...';
  }
}
