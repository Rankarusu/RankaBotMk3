import { CommandInteractionOption } from 'discord.js';

export class StringUtils {
  public static prettifyCommandOptions(
    options: readonly CommandInteractionOption[]
  ) {
    let optionString = '';
    for (let i = 0; i < options.length; i++) {
      optionString += `${options[i].name}: ${options[i].value} `;
    }
    return optionString;
  }
}
