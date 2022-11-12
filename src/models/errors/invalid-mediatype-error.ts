import { DiscordCommandError } from './discord-command-error';

export class InvalidMediaTypeError extends DiscordCommandError {
  constructor(acceptedTypes: string) {
    super();
    this.name = 'InvalidMediaTypeError';
    this.message = `The image you provided is not a valid media type.
    Please use one of the following types: ${acceptedTypes}`;
  }
}
