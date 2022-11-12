import { DiscordCommandError } from './discord-command-error';

export class PokemonNotFoundError extends DiscordCommandError {
  constructor() {
    super();
    this.name = 'PokemonNotFoundError';
    this.message = "I couldn't find any PokéMon matching that name or ID.";
  }
}
