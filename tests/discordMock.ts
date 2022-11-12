import { RESTJSONErrorCodes } from 'discord-api-types/v10';
import {
  CacheType,
  Channel,
  ChatInputCommandInteraction,
  Client,
  ClientUser,
  Collection,
  CommandInteractionOption,
  CommandInteractionOptionResolver,
  DateResolvable,
  Guild,
  GuildBanManager,
  GuildManager,
  GuildMember,
  GuildMemberManager,
  GuildTextBasedChannel,
  Message,
  PartialMessage,
  Snowflake,
  User,
  UserManager,
  VoiceBasedChannel,
  VoiceState,
  WebSocketManager,
} from 'discord.js';
import {
  RawInteractionData,
  RawUserData,
} from 'discord.js/typings/rawDataTypes';
import createMockInstance from 'jest-create-mock-instance';

const Config = require('../config/config.json');

//thanks to https://github.com/OpyFicarlogg/discord-bot-template for providing a rudimentary feamwork for testing.

class MockCommandInteraction extends ChatInputCommandInteraction {
  public constructor(client: Client, raw: RawInteractionData) {
    super(client, raw);
  }
}

class MockUser extends User {
  public constructor(client: Client, raw: RawUserData) {
    super(client, raw);
  }
}

class MockInvalidFormBodyOrContentTypeError extends Error {
  code: RESTJSONErrorCodes;

  constructor(message: string) {
    super(message);

    this.name = 'MockInvalidFormBodyOrContentTypeError';
    this.code = RESTJSONErrorCodes.InvalidFormBodyOrContentType;
  }
}

export class DiscordMock {
  private mockedCommandInteraction!: jest.Mocked<ChatInputCommandInteraction>;

  private mockedUser!: jest.Mocked<User>;

  private mockedClient!: jest.Mocked<Client>;

  private mockedChannel!: jest.Mocked<Channel>;

  private mockedMessage!: jest.Mocked<Message>;

  private mockedGuild!: jest.Mocked<Guild>;

  private mockedNewVoiceState!: jest.Mocked<VoiceState>;

  private mockedOldVoiceState!: jest.Mocked<VoiceState>;

  private mockedWebSocketManager!: jest.Mocked<WebSocketManager>;

  private static readonly GUILDID: string = 'abc';

  private static readonly USERID: string = '12';

  private static readonly DEVELOPER_USER_ID: string = Config.developers[0];

  private static readonly BOT_ID: string = Config.client.id;

  constructor() {
    this.mockWebSocketManager();
    this.mockClient();
    this.mockUser();
    this.mockChannel();
    this.mockGuild();
    this.mockMessage();
    this.mockNewVoiceState();
    this.mockOldVoiceState();
    this.mockCommand();
  }

  private mockWebSocketManager() {
    this.mockedWebSocketManager = {
      ping: 0,
    } as jest.Mocked<WebSocketManager>;
  }

  private mockClient() {
    const userManager = {} as jest.Mocked<UserManager>;
    const guildManager = {} as jest.Mocked<GuildManager>;
    const clientUser = {} as jest.Mocked<ClientUser>;

    clientUser.avatarURL = jest.fn(() => {
      return 'https://cdn.discordapp.com/avatars/0/0.webp';
    });

    //Mock by default the method fetch to return a user
    userManager.fetch = jest
      .fn()
      .mockImplementation(() => Promise.resolve(this.getMockUser()));

    this.mockedClient = createMockInstance(Client);
    this.mockedClient.users = userManager;
    this.mockedClient.guilds = guildManager;
    this.mockedClient.user = clientUser;
    Reflect.set(this.mockedClient, 'uptime', 1024);
    Reflect.set(this.mockedClient.guilds, 'cache', { size: 1024 });
    Reflect.set(this.mockedClient, 'ws', this.getMockWebSocketManager());
  }

  private mockUser(id = DiscordMock.USERID) {
    this.mockedUser = createMockInstance(MockUser);
    this.mockedUser.id = id;
    this.mockedUser.username = 'test';
    this.mockedUser.bot = false;
    Reflect.set(this.mockedUser, 'tag', 'bot#0000');
    this.mockedUser.displayAvatarURL = jest.fn(() => {
      return 'https://cdn.discordapp.com/avatars/0/0.webp';
    });
  }

  private mockCommand() {
    this.mockedCommandInteraction = createMockInstance(MockCommandInteraction);
    const mockedOptions = {} as jest.Mocked<CommandInteractionOptionResolver>;
    this.mockedCommandInteraction.id = '0';
    this.mockedCommandInteraction.options = mockedOptions;
    this.mockedCommandInteraction.guildId = DiscordMock.GUILDID;
    this.mockedCommandInteraction.user = this.mockedUser;
    this.mockedCommandInteraction.member = this.newMockGuildMember(
      DiscordMock.USERID
    );
    Reflect.set(
      this.mockedCommandInteraction,
      'channel',
      this.getMockChannel()
    );
    this.mockedCommandInteraction.channelId = '0';
    Reflect.set(this.mockedCommandInteraction, 'createdAt', new Date());
    Reflect.set(this.mockedCommandInteraction, 'client', this.getMockClient());
    Reflect.set(this.mockedCommandInteraction, 'guild', this.getMockGuild());
    this.mockedCommandInteraction.options.getString = jest.fn((option) => {
      const location = this.getCommandOptionLocation();

      const requestedOption = location.find((x) => x.name === option)?.value;
      return requestedOption?.toString() || '';
    });

    this.mockedCommandInteraction.options.getMember = jest.fn((option) => {
      const location = this.getCommandOptionLocation();

      const requestedOption = location.find((x) => x.name === option)?.member;
      return requestedOption || null;
    });

    this.mockedCommandInteraction.options.getUser = jest.fn((option) => {
      const location = this.getCommandOptionLocation();

      const requestedOption = location.find((x) => x.name === option)?.user;
      return requestedOption || null;
    });

    this.mockedCommandInteraction.options.getBoolean = jest.fn((option) => {
      const location = this.getCommandOptionLocation();

      const requestedOption = location.find((x) => x.name === option)?.value;

      if (typeof requestedOption == 'boolean') {
        return requestedOption;
      }
      return undefined;
    });

    this.mockedCommandInteraction.options.getNumber = jest.fn((option) => {
      const location = this.getCommandOptionLocation();

      const requestedOption = location.find((x) => x.name === option)?.value;

      if (typeof requestedOption == 'number') {
        return requestedOption;
      }
      return undefined;
    });

    this.mockedCommandInteraction.options.getSubcommand = jest.fn(() => {
      const type = this.mockedCommandInteraction.options.data[0]?.type;
      if (type === 2) {
        return this.mockedCommandInteraction.options.data[0].options[0].name;
      } else if (type === 1) {
        return this.mockedCommandInteraction.options.data[0].name;
      } else {
        return undefined;
      }
    });

    this.mockedCommandInteraction.options.getAttachment = jest.fn((option) => {
      const location = this.getCommandOptionLocation();

      const requestedOption = location.find(
        (x) => x.name === option
      )?.attachment;
      return requestedOption;
    });
  }

  private getCommandOptionLocation(): readonly CommandInteractionOption<CacheType>[] {
    //make sure we fetch the command options from the right place. The options are nested for subcommands and subcommandgroups
    const type = this.mockedCommandInteraction.options.data[0]?.type;

    let location: readonly CommandInteractionOption<CacheType>[];

    if (type === 2) {
      //subcommand group
      location =
        this.mockedCommandInteraction.options.data[0].options[0].options;
    } else if (type === 1) {
      //subcommand
      location = this.mockedCommandInteraction.options.data[0].options;
    } else {
      location = this.mockedCommandInteraction.options.data;
    }
    return location;
  }

  private mockGuild() {
    this.mockedGuild = {} as jest.Mocked<Guild>;
    this.mockedGuild.id = DiscordMock.GUILDID;
    this.mockedGuild.bans = {} as jest.Mocked<GuildBanManager>;
    this.mockedGuild.members = {} as jest.Mocked<GuildMemberManager>;
    this.mockedGuild.members.fetch = jest.fn();

    this.mockedGuild.bans.remove = jest.fn();
  }

  private mockChannel() {
    this.mockedChannel = {} as jest.Mocked<Channel>;
    (this.mockedChannel as GuildTextBasedChannel).bulkDelete = jest.fn(
      // eslint-disable-next-line require-await
      async () => {
        const messages: Collection<string, Message<boolean> | PartialMessage> =
          new Collection();
        messages.set('0', this.getMockMessage());
        return messages;
      }
    );
  }

  private mockMessage() {
    this.mockedMessage = {} as jest.Mocked<Message>;
    this.mockedMessage.author = this.mockedUser;
    Reflect.set(this.mockedMessage, 'guild', this.mockedGuild);
    this.mockedMessage.reply = jest.fn();
  }

  private mockNewVoiceState() {
    this.mockedNewVoiceState = {} as jest.Mocked<VoiceState>;
    //voice channel creation
    const voiceChannel = {} as VoiceBasedChannel;
    Reflect.set(
      voiceChannel,
      'members',
      new Collection<Snowflake, GuildMember>()
    );
    voiceChannel.members.set('1', this.newMockGuildMember());
    voiceChannel.name = 'test';

    this.mockedNewVoiceState.guild = this.getMockGuild();
    Reflect.set(this.mockedNewVoiceState, 'channel', voiceChannel);
    Reflect.set(this.mockedNewVoiceState, 'member', this.newMockGuildMember());
  }

  private mockOldVoiceState() {
    this.mockedOldVoiceState = {} as jest.Mocked<VoiceState>;
    Reflect.set(this.mockedOldVoiceState, 'channel', null);
    Reflect.set(this.mockedOldVoiceState, 'member', this.newMockGuildMember());
  }

  public getDevMember() {
    return this.newMockGuildMember(DiscordMock.DEVELOPER_USER_ID);
  }

  public getBotMember() {
    return this.newMockGuildMember(DiscordMock.BOT_ID);
  }

  public newMockGuildMember(
    userId: number | string = DiscordMock.USERID
  ): jest.Mocked<GuildMember> {
    const guildMember = {
      id: userId.toString(),
    } as jest.Mocked<GuildMember>;
    guildMember.user = this.getMockUser();
    Reflect.set(guildMember, 'tag', DiscordMock.GUILDID);
    guildMember.displayAvatarURL = jest.fn(() => {
      return 'https://cdn.discordapp.com/avatars/0/0.webp';
    });
    guildMember.ban = jest.fn();
    guildMember.kick = jest.fn();
    guildMember.disableCommunicationUntil = jest.fn(
      async (timeout: DateResolvable, reason?: string) => {
        const now = new Date();
        const apiLimit = now.setDate(now.getDate() + 4 * 7); //in 4 weeks
        if (timeout > apiLimit) {
          throw new MockInvalidFormBodyOrContentTypeError('Duration too long');
        }
        return guildMember;
      }
    );
    return guildMember;
  }

  public getMockWebSocketManager(): jest.Mocked<WebSocketManager> {
    return this.mockedWebSocketManager;
  }

  public getMockClient(): jest.Mocked<Client> {
    return this.mockedClient;
  }

  public getMockUser(): jest.Mocked<User> {
    return this.mockedUser;
  }

  public getMockCommandInteraction(): jest.Mocked<ChatInputCommandInteraction> {
    return this.mockedCommandInteraction;
  }

  public getMockMessage(): jest.Mocked<Message> {
    return this.mockedMessage;
  }

  public getMockChannel(): jest.Mocked<Channel> {
    return this.mockedChannel;
  }

  public getMockGuild(): jest.Mocked<Guild> {
    return this.mockedGuild;
  }

  public getMockNewVoiceState(): jest.Mocked<VoiceState> {
    return this.mockedNewVoiceState;
  }

  public getMockOldVoiceState(): jest.Mocked<VoiceState> {
    return this.mockedOldVoiceState;
  }
}
