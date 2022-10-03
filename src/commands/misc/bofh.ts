import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { EventData } from '../../models/event-data';
import bofh from '../../static/bofh.json';
import { EmbedUtils, InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

const excuses = bofh.excuses;

export class BofhCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'bofh',
    description: 'generate a bastard-operator-from-hell™-like excuse',
    dm_permission: true,
  };

  // cooldown?: RateLimiter;
  public usage = () => this.mention();

  public category: CommandCategory = CommandCategory.MISC;

  public deferType: CommandDeferType = CommandDeferType.NONE;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const excuse = this.getExcuse();
    const embed = EmbedUtils.infoEmbed(
      `The cause of your problem is:
      **${excuse}**`,
      'Bastard Operator From Hell Excuse Server'
    );
    InteractionUtils.send(interaction, embed);
  }

  private getExcuse(): string {
    const excuse = excuses[Math.floor(Math.random() * excuses.length)];
    return excuse;
  }
}
