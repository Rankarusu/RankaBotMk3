import { DiscordCommandError } from './discord-command-error';

export class ParsedTimeInPastError extends DiscordCommandError {
  constructor(timeStr: string) {
    super();
    this.name = 'ParsedTimeInPastError';
    this.message = `${timeStr} lies in the past.`;
  }
}
