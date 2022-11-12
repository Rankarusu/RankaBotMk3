import { DiscordCommandError } from './discord-command-error';

export class CommandNotFoundError extends DiscordCommandError {
  constructor(cmd: string) {
    super();
    this.name = 'CommandNotFoundError';
    this.message = `Command \`${cmd.toLowerCase()}\` not found or you may not use it`;
  }
}
