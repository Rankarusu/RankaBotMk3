import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { EmbedUtils, InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

const iterations = 5;

export class BlessCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'bless',
    description: 'remind yourself that you have bless up',
    dm_permission: true,
  };

  // cooldown?: RateLimiter;
  public usage = () => this.mention();

  public note = 'This command will ping you once every minute for 5 minutes.';

  public category: CommandCategory = CommandCategory.DND;

  public deferType: CommandDeferType = CommandDeferType.NONE;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const initialEmbed = EmbedUtils.infoEmbed(
      "Alright, I'm gonna ping you once a minute for 5 minutes so you don't forget to add your D4 to your Attack Rolls and Saving Throws",
      'Bless'
    );
    await InteractionUtils.send(interaction, initialEmbed);
    this.scheduleMessages(interaction);
  }

  private scheduleMessages(interaction: ChatInputCommandInteraction) {
    for (let i = 1; i <= iterations; i++) {
      const embed = EmbedUtils.blessEmbed(i, iterations);
      setTimeout(() => {
        InteractionUtils.send(interaction, embed);
      }, 60 * 1000 * i); // we schedule all times at once but with a minute in between. An alternative would be to use recursion.
    }
  }
}
