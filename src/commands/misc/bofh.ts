import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
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
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const excuse = this.getExcuse();
    const embed = this.createBofhEmbed(excuse);
    await InteractionUtils.send(interaction, embed);
  }

  private createBofhEmbed(excuse: string) {
    return EmbedUtils.infoEmbed(
      `The cause of your problem is:
      **${excuse}**`,
      'Bastard Operator From Hell Excuse Server'
    );
  }

  private getExcuse(): string {
    const excuse = excuses[Math.floor(Math.random() * excuses.length)];
    return excuse;
  }
}
