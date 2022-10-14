import {
  Channel,
  ChatInputCommandInteraction,
  Client,
  Collection,
  CommandInteractionOptionResolver,
  Guild,
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
    //Mock by default the method fetch to return a user
    userManager.fetch = jest
      .fn()
      .mockImplementation(() => Promise.resolve(this.getMockUser()));

    this.mockedClient = createMockInstance(Client);
    this.mockedClient.users = userManager;
    Reflect.set(this.mockedClient, 'ws', this.getMockWebSocketManager());
  }

  private mockUser() {
    this.mockedUser = createMockInstance(MockUser);
    this.mockedUser.id = '12';
    this.mockedUser.username = 'test';
    this.mockedUser.bot = false;
    Reflect.set(this.mockedUser, 'tag', 'bot#0000');
    this.mockedUser.displayAvatarURL = jest.fn(() => {
      return 'www.a.bc';
    });
  }

  private mockCommand() {
    this.mockedCommandInteraction = createMockInstance(MockCommandInteraction);
    const mockedOptions = {} as jest.Mocked<CommandInteractionOptionResolver>;
    this.mockedCommandInteraction.options = mockedOptions;
    this.mockedCommandInteraction.guildId = DiscordMock.GUILDID;
    this.mockedCommandInteraction.user = this.mockedUser;
    this.mockedCommandInteraction.member = this.newMockGuildMember(12);
    Reflect.set(this.mockedCommandInteraction, 'client', this.getMockClient());

    this.mockedCommandInteraction.options.getString = jest.fn((option) => {
      const requestedOption = this.mockedCommandInteraction.options.data.find(
        (x) => x.name === option
      )?.value;
      return requestedOption?.toString() || '';
    });

    this.mockedCommandInteraction.options.getMember = jest.fn((option) => {
      const requestedOption = this.mockedCommandInteraction.options.data.find(
        (x) => x.name === option
      )?.member;
      return requestedOption || null;
    });
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

  public newMockGuildMember(
    id: number | string = 12
  ): jest.Mocked<GuildMember> {
    const guildMember = {
      id: id.toString(),
    } as jest.Mocked<GuildMember>;
    guildMember.user = this.getMockUser();
    Reflect.set(guildMember, 'tag', 'abc');
    guildMember.displayAvatarURL = jest.fn(() => {
      return 'https://cdn.discordapp.com/avatars/0/0.webp';
    });
    return guildMember;
  }
}
