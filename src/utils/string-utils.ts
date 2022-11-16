import { CommandInteractionOption } from 'discord.js';

export class StringUtils {
  public static prettifyCommandOptions(
    options: readonly CommandInteractionOption[]
  ) {
    let optionString = '';
    options.forEach((option) => {
      optionString += `${option.name}: ${option.value} `;
    });
    return optionString;
  }

  public static capitalize(str: string) {
    return str.toLowerCase().charAt(0).toUpperCase() + str.slice(1);
  }

  public static toTitleCase(str: string) {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  public static truncate(str: string, n: number) {
    return str.length > n ? str.slice(0, n - 3) + '...' : str;
  }
}
