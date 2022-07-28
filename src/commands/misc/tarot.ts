import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  EmbedField,
  PermissionsString,
} from 'discord.js';

// eslint-disable-next-line node/no-unpublished-import
import { EventData } from '../../models/event-data';
import { Tarot } from '../../services/tarot';
import { EmbedUtils, InteractionUtils, StringUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class TarotCommand implements Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'tarot',
    description: "draw a tarot card and get infos about it's interpretation",
    dm_permission: true,
  };

  // cooldown?: RateLimiter;
  public helpText = '/tarot';

  public category: CommandCategory = CommandCategory.MISC;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  private deck = new Tarot();

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const card = this.deck.drawCard();
    const fields: EmbedField[] = [
      {
        name: 'Keywords',
        value: card.card.keywords.join('\n'),
        inline: false,
      },
      {
        name: 'Meanings',
        value: card.reverse
          ? card.card.meanings.shadow.join('\n')
          : card.card.meanings.light.join('\n'),
        inline: false,
      },
    ];
    const title = StringUtils.toTitleCase(card.card.name);

    const embed = EmbedUtils.infoEmbed(
      card.card.fortune_telling.join('\n'),
      card.reverse ? `${title} (reversed)` : title,
      fields
    );
    const file = new AttachmentBuilder(
      `${this.deck.pathToImages}${
        card.reverse ? card.card.imgReverse : card.card.img
      }`
    );
    embed.setImage(
      `attachment://${card.reverse ? card.card.imgReverse : card.card.img}`
    );
    //TODO: capitalize title

    InteractionUtils.send(interaction, embed, undefined, [file]);
  }
}
