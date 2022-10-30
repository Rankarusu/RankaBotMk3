import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
  ChatInputCommandInteraction,
  EmbedField,
  PermissionsString,
} from 'discord.js';
import { TarotCard, TarotCardDraw } from '../../models';
import { Tarot } from '../../services';
import { EmbedUtils, InteractionUtils, StringUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class TarotCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'tarot',
    description: 'draw or search for tarot cards',
    dm_permission: true,
    options: [
      {
        name: 'draw',
        type: ApplicationCommandOptionType.Subcommand,
        description: 'draw a random tarot card',
        options: [
          {
            name: 'no-reverse',
            type: ApplicationCommandOptionType.Boolean,
            description: 'exclude reverse cards',
            required: false,
          },
        ],
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
                required: false,
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
                required: false,
              },
            ],
          },
        ],
      },
    ],
  };

  // cooldown?: RateLimiter;
  public usage = () => `${this.mention('draw')}
  ${this.mention('major-arcana', 'search')} \`XXI - The World\` \`True\`
  ${this.mention('minor-arcana', 'search')} \`cups\` \`10\``;

  public category: CommandCategory = CommandCategory.MISC;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  private deck = new Tarot();

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const subCommand = interaction.options.getSubcommand();

    switch (subCommand) {
      case 'draw': {
        const noReverse = interaction.options.getBoolean('no-reverse') || false;
        const reverseChance = noReverse ? 0 : 0.5;
        const card: TarotCardDraw = this.deck.drawCard(reverseChance);
        const embed = this.createCardEmbed(card.card, card.reverse);
        await InteractionUtils.send(interaction, embed, undefined);
        break;
      }
      case 'major-arcana': {
        const num = interaction.options.getNumber('card');
        const reverse = interaction.options.getBoolean('reverse') || false;
        const card = this.deck.getMajorArcana(num);
        const embed = this.createCardEmbed(card, reverse);
        await InteractionUtils.send(interaction, embed, undefined);
        break;
      }
      case 'minor-arcana': {
        const suit = interaction.options.getString('suit');
        const rank = interaction.options.getString('rank');
        const maybeIntRank = parseInt(rank, 10) || rank;
        const reverse = interaction.options.getBoolean('reverse') || false;
        const card = this.deck.getMinorArcana(suit, maybeIntRank);
        const embed = this.createCardEmbed(card, reverse);
        await InteractionUtils.send(interaction, embed, undefined);
      }
    }
  }

  private createCardEmbed(card: TarotCard, reverse: boolean) {
    const fields: EmbedField[] = [
      {
        name: 'Keywords',
        value: card.keywords.join('\n'),
        inline: false,
      },
      {
        name: 'Meanings',
        value: reverse
          ? card.meanings.shadow.join('\n')
          : card.meanings.light.join('\n'),
        inline: false,
      },
    ];
    const title = StringUtils.toTitleCase(card.name);

    const embed = EmbedUtils.infoEmbed(
      card.fortune_telling.join('\n'),
      reverse ? `${title} (reversed)` : title,
      fields
    );

    embed.setImage(reverse ? card.imgReverse : card.img);
    return embed;
  }
}
