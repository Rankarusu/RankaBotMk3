import {
  CacheType,
  Channel,
  ChatInputCommandInteraction,
  Client,
  ClientUser,
  Collection,
  CommandInteractionOption,
  CommandInteractionOptionResolver,
  Guild,
  GuildManager,
  GuildMember,
  Message,
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
    this.mockCommand();
    this.mockGuild();
    this.mockMessage();
    this.mockNewVoiceState();
    this.mockOldVoiceState();
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
    this.mockedCommandInteraction.channelId = '0';
    Reflect.set(this.mockedCommandInteraction, 'createdAt', new Date());
    Reflect.set(this.mockedCommandInteraction, 'client', this.getMockClient());

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
  }

  private mockMessage() {
    this.mockedMessage = {} as jest.Mocked<Message>;
    this.mockedMessage.author = this.mockedUser;
    //Allow to set a private/protected method
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
