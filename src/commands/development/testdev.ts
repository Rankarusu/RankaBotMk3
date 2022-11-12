/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable require-await */
import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { Command, CommandCategory, CommandDeferType } from '..';
import { InteractionUtils } from '../../utils';

export class TestCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'test',
    description: 'test',
    dm_permission: true,
    default_member_permissions: undefined,
    options: [
      {
        name: 'test-option',
        type: ApplicationCommandOptionType.String,
        description: 'test-option-description',
      },
    ],
  };

  // cooldown?: RateLimiter;
  public usage = () => this.mention();

  public category: CommandCategory = CommandCategory.DEVELOPMENT;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public developerOnly?: boolean = true;

  public nsfw?: boolean = true;

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    console.log(this.id);
    InteractionUtils.send(interaction, `</${this.metadata.name}:${this.id}>`);
  }
}
