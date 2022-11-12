import { DiscordCommandWarning } from './discord-command-warning';

export class InsufficientPermissionsWarning extends DiscordCommandWarning {
  constructor() {
    super();
    this.name = 'InsufficientPermissionsWarning';
    this.message = 'You do not have permission to use this command';
  }
}
