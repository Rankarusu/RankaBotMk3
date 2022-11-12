import { DiscordCommandWarning } from './discord-command-warning';

export class NoUsersTrackedByExpWarning extends DiscordCommandWarning {
  constructor() {
    super();
    this.name = 'NoUsersTrackedByExpWarning';
    this.message =
      'There are currently no users registered in the EXP-System. Try to send some messages.';
  }
}
