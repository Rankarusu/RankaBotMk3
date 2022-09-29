import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { EventData } from '../../models/event-data';
import { EmbedUtils, InteractionUtils, StringUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class RollCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'roll',
    description: 'roll dice!',
    dm_permission: true,
    options: [
      {
        name: 'dice',
        type: ApplicationCommandOptionType.String,
        description: 'dice to roll and modifiers to add',
        required: true,
        max_length: 128,
      },
    ],
  };

  // cooldown?: RateLimiter;
  public helpText = '/roll `4d10+20`';

  public category: CommandCategory = CommandCategory.DND;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const dice = interaction.options.getString('dice');
    if (!dice.match(/^[\d\sdDwW+-]+$/)) {
      InteractionUtils.sendError(
        data,
        'There are invalid characters in your input.'
      );
    }

    const dicearr = dice
      .replaceAll(/\s/g, '')
      .split(/([+-])/)
      .filter((e) => e); //to get rid of empty array items. the split above leaves multiple signs in a row with an empty string in between

    const output = this.evaluate(dicearr);
    const embed = EmbedUtils.infoEmbed(
      `\`${StringUtils.truncate(output.resultstr, 2048)}\`
      **= ${output.result}**`,
      `🎲 ${dicearr.join(' ')}`
    );
    await InteractionUtils.send(interaction, embed);
  }

  private rollDice(str: string): { result: number; resultstr: string } {
    //match everything up to 100d100
    const roll = str.match(/^([1-9][0-9]?|100)?[dDwW]([1-9][0-9]?|100)$/);

    let result = 0;
    const resultarr = [];

    if (!roll) {
      throw new Error('invalid Dice');
    }

    const times = parseInt(roll[1]) || 1;
    const die = parseInt(roll[2]);

    for (let i = 0; i < times; i++) {
      const rollResult = Math.floor(Math.random() * die) + 1;
      resultarr.push(rollResult);
      result = result + rollResult;
    }
    return {
      result,
      resultstr: `(${resultarr.join(' + ')})`,
    };
  }

  private evaluate(dicearr: string[]): { result: number; resultstr: string } {
    let result = 0;
    const resultstr = [];
    let sign: string;

    console.log(dicearr);

    dicearr.forEach((item) => {
      if (item === '+' || item === '-') {
        //flip sign on double negatives.
        if (item === '-' && sign === '-') {
          sign = '+';
        } else {
          sign = item;
        }
        resultstr.push(item);
      } else if (item.match(/^\d+$/)) {
        //add numbers
        if (!sign || sign === '+') {
          result = result + parseInt(item);
        } else {
          result = result - parseInt(item);
        }
        resultstr.push(item);
        //make sure to reset sign once we actually modified values.
        sign = undefined;
      } else {
        //roll dice
        const roll = this.rollDice(item);
        if (!sign || sign === '+') {
          result = result + roll.result;
        } else {
          result = result - roll.result;
        }
        resultstr.push(roll.resultstr);
        sign = undefined;
      }
    });

    return { result, resultstr: resultstr.join(' ') };
  }
}