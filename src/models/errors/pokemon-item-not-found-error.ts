import { DiscordCommandError } from './discord-command-error';

export class PokemonItemNotFoundError extends DiscordCommandError {
  constructor() {
    super();
    this.name = 'PokemonItemNotFoundError';
    this.message = `I couldn't find any items matching that name or ID.
            
    **Note**: The API uses kebab-case for abilities.
    E.G if you want to find the fishing rod, you would use 'fishing-rod'.
    There will be a point in the future where I will implement fuzzy search, but today is not the day.`;
  }
}
