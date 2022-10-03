import {
  ApplicationCommandOptionChoiceData,
  AutocompleteFocusedOption,
} from 'discord.js';
import pokemon from '../static/data/pokemon.json';
import { Autocomplete } from './autocomplete';

export class PokemonAutocomplete implements Autocomplete {
  public name = 'pokemon-name';

  public async execute(focusedValue: AutocompleteFocusedOption) {
    const filtered: ApplicationCommandOptionChoiceData[] = [];
    let limit = 0;
    for (const choice of pokemon) {
      if (
        choice.name.toLowerCase().includes(focusedValue.value.toLowerCase())
      ) {
        filtered.push(choice as ApplicationCommandOptionChoiceData);
        limit++;
      }
      if (limit === 10) {
        break;
      }
    }

    return filtered;
  }
}
