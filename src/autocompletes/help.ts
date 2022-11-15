import {
  ApplicationCommandOptionChoiceData,
  AutocompleteFocusedOption,
} from 'discord.js';
import { Autocomplete } from '.';
import { Command } from '../commands';

export class CommandAutocomplete implements Autocomplete {
  public name = 'command';

  private commands: Command[];

  constructor(commands: Command[]) {
    this.commands = commands;
  }

  public execute(focusedValue: AutocompleteFocusedOption) {
    const filtered: ApplicationCommandOptionChoiceData[] = [];
    let limit = 0;
    for (const command of this.commands) {
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
