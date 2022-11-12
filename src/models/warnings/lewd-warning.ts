import { DiscordCommandWarning } from './discord-command-warning';

export class LewdWarning extends DiscordCommandWarning {
  constructor(image: string) {
    super();
    this.name = 'LewdWarning';
    this.message = 'lewd.';
    this.imageUrl = image;
  }
}
