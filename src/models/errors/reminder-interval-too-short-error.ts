import { DiscordCommandError } from './discord-command-error';

export class ReminderIntervalTooShortError extends DiscordCommandError {
  constructor() {
    super();
    this.name = 'ReminderIntervalTooShortError';
    this.message = 'Is your attention span really that small?';
  }
}
