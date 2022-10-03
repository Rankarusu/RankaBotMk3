import {
  ApplicationCommandOptionChoiceData,
  AutocompleteFocusedOption,
} from 'discord.js';

export interface Autocomplete {
  name: string;
  // we could put a minimum required length here.
  execute(
    focusedValue: AutocompleteFocusedOption
  ): Promise<ApplicationCommandOptionChoiceData[]>;
}
