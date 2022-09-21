import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';

import { EventData } from '../../models/event-data';
import { Poll } from '../../models/poll';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class PollCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'poll',
    description: 'start a poll to decide on something with up to 10 options',
    dm_permission: false,
    options: [
      {
        name: 'question',
        type: ApplicationCommandOptionType.String,
        description: 'the question to ask',
        required: true,
      },
      {
        name: 'only-one-vote',
        type: ApplicationCommandOptionType.Boolean,
        description: 'limit to only one vote per user',
        required: true,
      },
      {
        name: 'time-limit',
        type: ApplicationCommandOptionType.Number,
        description: 'the time limit for the poll in minutes',
        required: true,
        min_value: 1,
        max_value: 60 * 24,
      },
      {
        name: 'option-01',
        type: ApplicationCommandOptionType.String,
        description: 'option 01',
        required: true,
      },
      {
        name: 'option-02',
        type: ApplicationCommandOptionType.String,
        description: 'option 02',
        required: true,
      },
      {
        name: 'option-03',
        type: ApplicationCommandOptionType.String,
        description: 'option 03',
        required: false,
      },
      {
        name: 'option-04',
        type: ApplicationCommandOptionType.String,
        description: 'option 04',
        required: false,
      },
      {
        name: 'option-05',
        type: ApplicationCommandOptionType.String,
        description: 'option 05',
        required: false,
      },
      {
        name: 'option-06',
        type: ApplicationCommandOptionType.String,
        description: 'option 06',
        required: false,
      },
      {
        name: 'option-07',
        type: ApplicationCommandOptionType.String,
        description: 'option 07',
        required: false,
      },
      {
        name: 'option-08',
        type: ApplicationCommandOptionType.String,
        description: 'option 08',
        required: false,
      },
      {
        name: 'option-09',
        type: ApplicationCommandOptionType.String,
        description: 'option 09',
        required: false,
      },
      {
        name: 'option-10',
        type: ApplicationCommandOptionType.String,
        description: 'option 10',
        required: false,
      },
    ],
  };

  // cooldown?: RateLimiter;
  public helpText =
    '/poll `Whats your favorite color?` `True` `30` `red` `blue` `green`';

  public category: CommandCategory = CommandCategory.MISC;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = [
    'SendMessages',
    'AddReactions',
  ];

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const question = interaction.options.getString('question');
    const options = interaction.options.data.filter((option) =>
      option.name.match(/option-\d\d/g)
    );
    const timeLimit = interaction.options.getNumber('time-limit');
    const onlyOneVote = interaction.options.getBoolean('only-one-vote');

    const poll = new Poll(question, options, timeLimit, onlyOneVote);
    poll.start(interaction);
  }
}
