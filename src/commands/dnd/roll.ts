import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { InvalidInputError } from '../../models';
import { EmbedUtils, InteractionUtils, StringUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class RollCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'roll',
    description: 'roll polyhedral dice',
    dm_permission: true,
    options: [
      {
        name: 'dice',
        type: ApplicationCommandOptionType.String,
        description: 'dice and modifiers',
        required: true,
        max_length: 128,
      },
    ],
  };

  // cooldown?: RateLimiter;
  public usage = () => `${this.mention()} \`4d10+20\``;

  public category: CommandCategory = CommandCategory.DND;

  public deferType: CommandDeferType = CommandDeferType.NONE;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const dice = interaction.options.getString('dice');
    if (!dice.match(/^[\d\sdDwW+-]+$/)) {
      //anything that is not a number, d,D,w,W
      throw new InvalidInputError();
    }

    const diceArr = this.cleanInput(dice);
    let output: { result: number; resultStr: string };
    try {
      output = this.evaluate(diceArr);
    } catch (error) {
      throw new InvalidInputError();
    }

    const embed = this.createRollEmbed(diceArr, output);
    await InteractionUtils.send(interaction, embed);
  }

  private cleanInput(dice: string) {
    return dice
      .replaceAll(/\s/g, '')
      .split(/([+-])/)
      .filter((e) => e); //to get rid of empty array items. the split above leaves multiple signs in a row with an empty string in between
  }

  private rollDice(str: string): { result: number; resultStr: string } {
    //match everything up to 100d100
    const roll = str.match(/^([1-9]\d?|100)?[dDwW]([1-9]\d?|100)$/);

    let result = 0;
    const resultArr = [];

    if (!roll) {
      throw new Error('invalid Dice');
    }

    const times = parseInt(roll[1]) || 1;
    const die = parseInt(roll[2]);

    for (let i = 0; i < times; i++) {
      const rollResult = Math.floor(Math.random() * die) + 1;
      resultArr.push(rollResult);
      result = result + rollResult;
    }
    return {
      result,
      resultStr: `(${resultArr.join(' + ')})`,
    };
  }

  private evaluate(diceArr: string[]): { result: number; resultStr: string } {
    let result = 0;
    const resultStr = [];
    let sign: string;

    diceArr.forEach((item) => {
      if (item === '+' || item === '-') {
        //flip sign on double negatives.
        if (item === '-' && sign === '-') {
          sign = '+';
        } else {
          sign = item;
        }
        resultStr.push(item);
      } else if (item.match(/^\d+$/)) {
        //add numbers
        if (!sign || sign === '+') {
          result = result + parseInt(item);
        } else {
          result = result - parseInt(item);
        }
        resultStr.push(item);
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
        resultStr.push(roll.resultStr);
        sign = undefined;
      }
    });

    return { result, resultStr: resultStr.join(' ') };
  }

  private createRollEmbed(
    diceArr: string[],
    output: { result: number; resultStr: string }
  ) {
    const embed = EmbedUtils.infoEmbed(
      `\`${StringUtils.truncate(output.resultStr, 2048)}\`
      **= ${output.result}**`,
      `🎲 ${diceArr.join(' ')}`
    );
    return embed;
  }
}
