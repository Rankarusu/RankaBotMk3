import { DiscordCommandError } from './discord-command-error';

export class ReminderCreationError extends DiscordCommandError {
  constructor() {
    super();
    this.name = 'ReminderCreationError';
    this.message = 'Something went wrong while creating the reminder.';
  }
}
