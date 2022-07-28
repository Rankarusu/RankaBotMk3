import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
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
    description: 'draw or search for tarot cards',
    dm_permission: true,
    options: [
      {
        name: 'draw',
        type: ApplicationCommandOptionType.Subcommand,
        description: 'draw a random tarot card',
      },
      {
        name: 'search',
        type: ApplicationCommandOptionType.SubcommandGroup,
        description: 'search for a tarot card',
        options: [
          {
            name: 'major-arcana',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'search for a major arcana card',
            options: [
              {
                name: 'card',
                type: ApplicationCommandOptionType.Number,
                description: 'the card to search for',
                required: true,
                choices: [
                  { name: '0 - The Fool', value: 0 },
                  { name: 'I - The Magician', value: 1 },
                  { name: 'II - The High Priestess', value: 2 },
                  { name: 'III - The Empress', value: 3 },
                  { name: 'IV - The Emperor', value: 4 },
                  { name: 'V - The Hierophant', value: 5 },
                  { name: 'VI - The Lovers', value: 6 },
                  { name: 'VII - The Chariot', value: 7 },
                  { name: 'VIII - Strength', value: 8 },
                  { name: 'IX - The Hermit', value: 9 },
                  { name: 'X - Wheel of Fortune', value: 10 },
                  { name: 'XI - Justice', value: 11 },
                  { name: 'XII - The Hanged Man', value: 12 },
                  { name: 'XIII - Death', value: 13 },
                  { name: 'XIV - Temperance', value: 14 },
                  { name: 'XV - The Devil', value: 15 },
                  { name: 'XVI - The Tower', value: 16 },
                  { name: 'XVII - The Star', value: 17 },
                  { name: 'XVIII - The Moon', value: 18 },
                  { name: 'XIX - The Sun', value: 19 },
                  { name: 'XX - Judgement', value: 20 },
                  { name: 'XXI - The World', value: 21 },
                ],
              },
              {
                name: 'reverse',
                type: ApplicationCommandOptionType.Boolean,
                description: 'get meaning of the reversed card',
                required: true,
              },
            ],
          },
          {
            name: 'minor-arcana',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'search for a minor arcana card',
            options: [
              {
                name: 'suit',
                type: ApplicationCommandOptionType.String,
                description: 'the suit of the card to search for',
                required: true,
                choices: [
                  { name: 'wands', value: 'wands' },
                  { name: 'swords', value: 'swords' },
                  { name: 'pentacles', value: 'pentacles' },
                  { name: 'cups', value: 'cups' },
                ],
              },
              {
                name: 'rank',
                type: ApplicationCommandOptionType.String,
                description: 'the rank of the card to search for',
                required: true,
                choices: [
                  { name: 'ace', value: '1' },
                  { name: '2', value: '2' },
                  { name: '3', value: '3' },
                  { name: '4', value: '4' },
                  { name: '5', value: '5' },
                  { name: '6', value: '6' },
                  { name: '7', value: '7' },
                  { name: '8', value: '8' },
                  { name: '9', value: '9' },
                  { name: '10', value: '10' },
                  { name: 'page', value: 'page' },
                  { name: 'knight', value: 'knight' },
                  { name: 'queen', value: 'queen' },
                  { name: 'king', value: 'king' },
                ],
              },
              {
                name: 'reverse',
                type: ApplicationCommandOptionType.Boolean,
                description: 'get meaning of the reversed card',
                required: true,
              },
            ],
          },
        ],
      },
    ],
  };

  // cooldown?: RateLimiter;
  public helpText = `/tarot draw
  /tarot search major-arcana Death True
  /tarot search minor-arcana cups 10 False`;

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
    InteractionUtils.send(interaction, embed, undefined, [file]);
  }
}
