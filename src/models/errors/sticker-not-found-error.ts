import { DiscordCommandError } from './discord-command-error';

export class StickerNotFoundError extends DiscordCommandError {
  constructor(name: string) {
    super();
    this.name = 'StickerNotFoundError';
    this.message = `I could not find the sticker ${name} on this server.`;
  }
}
