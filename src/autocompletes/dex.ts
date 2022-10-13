import {
  ApplicationCommandOptionChoiceData,
  AutocompleteFocusedOption,
} from 'discord.js';
import { Autocomplete } from '.';
import pokemon from '../static/pokemon.json';

export class PokemonAutocomplete implements Autocomplete {
  public name = 'pokemon-name';

  public execute(focusedValue: AutocompleteFocusedOption) {
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
