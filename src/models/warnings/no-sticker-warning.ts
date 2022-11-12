import { DiscordCommandWarning } from './discord-command-warning';

export class NoStickerWarning extends DiscordCommandWarning {
  constructor() {
    super();
    this.name = 'NoStickerWarning';
    this.message =
      'There are currently no stickers available on this server. Use `/sticker add` to add one.';
  }
}
