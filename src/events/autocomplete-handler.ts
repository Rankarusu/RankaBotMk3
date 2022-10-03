import { AutocompleteInteraction } from 'discord.js';
import { Autocomplete } from '../autocompletes';
import { Logger } from '../services';
import { EventHandler } from './event-handler';

import LogMessages from '../static/logs/logs.json';

export class AutoCompleteHandler implements EventHandler {
  constructor(public autocompletes: Autocomplete[]) {}

  public async process(intr: AutocompleteInteraction): Promise<void> {
    // Don't respond to self, or other bots
    if (intr.user.id === intr.client.user?.id || intr.user.bot) {
      return;
    }

    const focusedValue = intr.options.getFocused(true);

    // Try to find the autocomplete the user wants
    const autocomplete = this.autocompletes.find(
      (ac) => ac.name === focusedValue.name
    );
    if (!autocomplete) {
      Logger.error(
        LogMessages.error.autocompleteNotFound
          .replaceAll('{INTERACTION_ID}', intr.id)
          .replaceAll('{OPTION_NAME}', focusedValue.name)
      );
      return;
    }

    const choices = await autocomplete.execute(focusedValue);

    try {
      intr.respond(choices);
    } catch (error) {
      Logger.error(LogMessages.error.autoComplete);
    }
  }
}
