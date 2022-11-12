import { DiscordCommandWarning } from './discord-command-warning';

export class WeirdTastesWarning extends DiscordCommandWarning {
  constructor() {
    super();
    this.name = 'WeirdTastesWarning';
    this.message =
      'I could not find anything matching your taste you sick fuck.';
  }
}
