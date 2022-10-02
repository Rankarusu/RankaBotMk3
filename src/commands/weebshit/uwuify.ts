import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { EventData } from '../../models/event-data';
import { InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

const uwuMap = [
  {
    pattern: /(?:r|l)/g,
    replaceValue: 'w',
  },
  {
    pattern: /(?:R|L)/g,
    replaceValue: 'W',
  },
  {
    pattern: /n([aeiou])/g,
    replaceValue: 'ny$1',
  },
  {
    pattern: /N([aeiou])/g,
    replaceValue: 'Ny$1',
  },
  {
    pattern: /N([AEIOU])/g,
    replaceValue: 'Ny$1',
  },
  {
    pattern: /ove/g,
    replaceValue: 'uv',
  },
];
const kaomoji = [
  // `(・\`ω\´・)`,
  ';;w;;',
  'OwO',
  'UwU',
  '>w<',
  '^w^',
  'ÚwÚ',
  '^-^',
  ':3',
  'x3',
];
const exclamations = ['!?', '?!!', '?!?1', '!!11', '?!?!'];
const actions = [
  '*blushes*',
  '*whispers to self*',
  '*cries*',
  '*screams*',
  '*sweats*',
  '*twerks*',
  '*runs away*',
  '*screeches*',
  '*walks away*',
  '*sees bulge*',
  '*looks at you*',
  '*notices buldge*',
  '*starts twerking*',
  '*huggles tightly*',
  '*boops your nose*',
];

const discordCharLimit = 2000;

export class UwuifyCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'uwuify',
    description: 'make your text more uwu',
    dm_permission: true,
    options: [
      {
        name: 'text',
        type: ApplicationCommandOptionType.String,
        description: 'the text you want modified',
        required: true,
      },
    ],
  };

  // cooldown?: RateLimiter;
  public usage = `/uwuify \`insert copypasta here\``;

  public category: CommandCategory = CommandCategory.WEEBSHIT;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    let text = interaction.options.getString('text');
    text = this.replaceLetters(text);
    text = this.replaceExclamations(text);
    text = this.addActions(text, 0.05);
    console.log(text);
    const textChunks = [];
    let i = 0;
    let j = discordCharLimit; //discord char limit;
    while (i < text.length) {
      textChunks.push(text.slice(i, j));

      i = j;
      j += discordCharLimit;
    }
    console.log(i, j);
    console.log(textChunks.length);
    textChunks.forEach(async (chunk) => {
      await InteractionUtils.send(interaction, chunk);
    });
  }

  private replaceLetters(text: string) {
    uwuMap.forEach((uwu) => {
      text = text.replaceAll(uwu.pattern, uwu.replaceValue);
    });
    return text;
  }

  private replaceExclamations(text: string) {
    const pattern = /[?!]+$/i;
    const words = text.split(' ');
    const newSentence = words
      .map((word) =>
        word.replace(
          pattern,
          exclamations[Math.floor(Math.random() * exclamations.length)]
        )
      )
      .join(' ');
    return newSentence;
  }

  private addActions(text: string, percentage: number) {
    const words = text.split(' ');
    const newSentence = words
      .map((word) => {
        //have an initial chance for stuff to happen and then a 1/3 chance for each.
        if (Math.random() > percentage) {
          return word;
        }
        if (Math.random() < 0.66) {
          return `${
            kaomoji[Math.floor(Math.random() * kaomoji.length)]
          } ${word}`;
        } else if (Math.random() < 0.33) {
          return `${
            actions[Math.floor(Math.random() * actions.length)]
          } ${word}`;
        } else {
          const stutter = Math.floor(Math.random() * 2);
          return `${(word.charAt(0) + '-').repeat(stutter)}${word}`;
        }
      })
      .join(' ');
    return newSentence;
  }
}
