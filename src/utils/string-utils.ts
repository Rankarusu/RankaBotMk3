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

  public static toTitleCase(str: string) {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
