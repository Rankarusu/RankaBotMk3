import { GuildMember } from 'discord.js';
import { DateUtils } from '../../utils';
import { DiscordCommandWarning } from './discord-command-warning';

export class AlreadyTimedOutWarning extends DiscordCommandWarning {
  constructor(member: GuildMember, timedOutUntil: Date) {
    super();
    this.name = 'AlreadyTimedOutWarning';
    this.message = `${
      member.user.tag
    } is already timed out until <t:${DateUtils.getUnixTime(timedOutUntil)}:f>`;
  }
}
