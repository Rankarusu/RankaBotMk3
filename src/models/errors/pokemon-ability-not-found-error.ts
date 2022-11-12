import { DiscordCommandError } from './discord-command-error';

export class PokemonAbilityNotFoundError extends DiscordCommandError {
  constructor() {
    super();
    this.name = 'PokemonAbilityNotFoundError';
    this.message = `I couldn't find any abilities matching that name or ID. 
            
    **Note**: The API uses kebab-case for abilities.
    E.G if you want to find Bad Dreams, you would use 'bad-dreams'.
    There will be a point in the future where I will implement fuzzy search, but today is not the day.`;
  }
}
