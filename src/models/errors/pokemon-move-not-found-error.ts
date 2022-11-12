import { DiscordCommandError } from './discord-command-error';

export class PokemonMoveNotFoundError extends DiscordCommandError {
  constructor() {
    super();
    this.name = 'PokemonMoveNotFoundError';
    this.message = `I couldn't find any moves matching that name or ID.

    **Note**: The API uses kebab-case for abilities.
    E.G if you want to find hyper beam, you would use 'hyper-beam'.
    There will be a point in the future where I will implement fuzzy search, but today is not the day.`;
  }
}
