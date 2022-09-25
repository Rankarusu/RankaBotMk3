import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  PermissionsString,
} from 'discord.js';
import path from 'path';
import { EventData } from '../../models/event-data';
import { EmbedUtils, InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

const pathToImages = path.resolve(__dirname, '../../static/images/');
const blessImage = 'bless.png';

export class BlessCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'bless',
    description: 'reminds you that you have bless up',
    dm_permission: true,
  };

  // cooldown?: RateLimiter;
  public helpText = '/bless`';

  public category: CommandCategory = CommandCategory.DND;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const initialEmbed = EmbedUtils.infoEmbed(
      "Alright, I'm gonna ping you once a minute for 5 minutes so you don't forget to add your D4 to your Attack Rolls and Saving Throws",
      'Bless'
    );
    const image = new AttachmentBuilder(`${pathToImages}/${blessImage}`);

    const followUpEmbed = EmbedUtils.infoEmbed(
      "You have **Bless** up, don't forget to add a **D4** to your **Attack Rolls** and **Saving Throws**."
    ).setColor('#F9DC92');
    await InteractionUtils.send(interaction, initialEmbed);
    for (let i = 1; i <= 5; i++) {
      setTimeout(() => {
        InteractionUtils.send(
          interaction,
          followUpEmbed
            .setTitle(`Bless ${i}/5`)
            .setThumbnail(`attachment://${blessImage}`),
          undefined,
          [image]
        );
      }, 60 * 1000 * i); // we schedule all times at once but with a minute in between. An alternative would be to use recursion.
    }
  }
}
