import { DiscordCommandWarning } from './discord-command-warning';

export class NoLewdsAvailableWarning extends DiscordCommandWarning {
  constructor() {
    super();
    this.name = 'NoLewdsAvailableWarning';
    this.message =
      'There are currently no more lewds available, please try again in a few minutes.';
  }
}
