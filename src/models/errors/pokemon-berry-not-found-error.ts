import { DiscordCommandError } from './discord-command-error';

export class PokemonBerryNotFoundError extends DiscordCommandError {
  constructor() {
    super();
    this.name = 'PokemonBerryNotFoundError';
    this.message = `I couldn't find any berries matching that name or ID.`;
  }
}
