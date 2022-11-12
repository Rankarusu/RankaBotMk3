import { DiscordCommandError } from './discord-command-error';

export class StickerAddError extends DiscordCommandError {
  constructor() {
    super();
    this.name = 'StickerAddError';
    this.message = 'Something went wrong while adding the sicker.';
  }
}
