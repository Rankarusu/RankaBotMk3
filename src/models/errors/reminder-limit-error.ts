import { DiscordCommandError } from './discord-command-error';

export class ReminderLimitError extends DiscordCommandError {
  constructor() {
    super();
    this.name = 'ReminderLimitError';
    this.message = 'You cannot create more reminders.';
  }
}
