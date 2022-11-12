import { DiscordCommandWarning } from './discord-command-warning';

export class NotTrackedByExpWarning extends DiscordCommandWarning {
  constructor() {
    super();
    this.name = 'NotTrackedByExpWarning';
    this.message = 'This user is not tracked by the EXP-System yet.';
  }
}
