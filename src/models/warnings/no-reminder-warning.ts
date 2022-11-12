import { DiscordCommandWarning } from './discord-command-warning';

export class NoReminderWarning extends DiscordCommandWarning {
  constructor() {
    super();
    this.name = 'NoReminderWarning';
    this.message = `You have no reminders set at the moment. Use \`/remind set\` to set one.`;
  }
}
