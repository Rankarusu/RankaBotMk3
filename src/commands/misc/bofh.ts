import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { EventData } from '../../models/event-data';
import bofh from '../../static/data/bofh.json';
import { EmbedUtils, InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class BofhCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'bofh',
    description: 'generate a bastard-operator-from-hell™-like excuse',
    dm_permission: true,
  };

  // cooldown?: RateLimiter;
  public usage = '/bofh';

  public category: CommandCategory = CommandCategory.MISC;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  private excuses: string[] = bofh.excuses;

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
    const excuse =
      this.excuses[Math.floor(Math.random() * this.excuses.length)];
    return excuse;
  }
}
