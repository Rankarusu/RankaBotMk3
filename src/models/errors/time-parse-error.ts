import { DiscordCommandError } from './discord-command-error';

export class TimeParseError extends DiscordCommandError {
  constructor(timeStr: string) {
    super();
    this.name = 'TimeParseError';
    this.message = `Could not parse the time: ${timeStr}`;
  }
}
