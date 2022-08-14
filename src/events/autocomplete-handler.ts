import { AutocompleteInteraction } from 'discord.js';
import pokemon from '../../data/pokemon.json';
import { EventHandler } from './event-handler';

export class AutoCompleteHandler implements EventHandler {
  public async process(intr: AutocompleteInteraction): Promise<void> {
    // Don't respond to self, or other bots
    if (intr.user.id === intr.client.user?.id || intr.user.bot) {
      return;
    }
    if (intr.commandName === 'dex') {
      const focusedValue = intr.options.getFocused(true);
      const filtered = [];
      let limit = 0;
      for (const choice of pokemon) {
        if (
          choice.name.toLowerCase().includes(focusedValue.value.toLowerCase())
        ) {
          filtered.push(choice);
          limit++;
        }
        if (limit === 10) {
          break;
        }
      }
      await intr.respond(
        filtered.map((choice) => ({ name: choice.name, value: choice.value }))
      );
    }
  }
}
