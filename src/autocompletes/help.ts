import {
  ApplicationCommandOptionChoiceData,
  AutocompleteFocusedOption,
} from 'discord.js';
import { bot } from '..';
import { Autocomplete } from './autocomplete';

export class CommandAutocomplete implements Autocomplete {
  public name = 'command';

  public execute(focusedValue: AutocompleteFocusedOption) {
    const commands = bot.getCommands();

    const filtered: ApplicationCommandOptionChoiceData[] = [];
    let limit = 0;
    for (const command of commands) {
      if (
        command.metadata.name
          .toLowerCase()
          .includes(focusedValue.value.toLowerCase())
      ) {
        filtered.push({
          name: command.metadata.name,
          value: command.metadata.name,
        } as ApplicationCommandOptionChoiceData);
        limit++;
      }
      if (limit === 10) {
        break;
      }
    }

    return filtered;
  }
}
