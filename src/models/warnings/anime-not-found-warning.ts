import { DiscordCommandWarning } from './discord-command-warning';

export class AnimeNotFoundWarning extends DiscordCommandWarning {
  constructor(title: string) {
    super();
    this.name = 'AnimeNotFoundWarning';
    this.message = `I could not find any anime with the name \`${title}\``;
  }
}
