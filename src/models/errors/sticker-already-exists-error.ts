import { DiscordCommandError } from './discord-command-error';

export class StickerAlreadyExistsError extends DiscordCommandError {
  constructor(name: string) {
    super();
    this.name = 'StickerAlreadyExistsError';
    this.message = `A sticker with name \`${name}\` already exists on this server.`;
  }
}
