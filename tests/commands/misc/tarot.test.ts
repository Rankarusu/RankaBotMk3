import { TarotCommand } from '../../../src/commands';
import { CommandTestHelper } from '../helper';

const drawInputs = [
  [
    [{ name: 'draw', type: 1, options: [] }],
    [
      {
        name: 'draw',
        type: 1,
        options: [{ name: 'no-reverse', type: 5, value: true }],
      },
    ],
    [
      {
        name: 'draw',
        type: 1,
        options: [{ name: 'no-reverse', type: 5, value: false }],
      },
    ],
  ],
];

const majorArcanaInputs = [
  [
    [
      {
        name: 'search',
        type: 2,
        options: [
          {
            name: 'major-arcana',
            type: 1,
            options: [
              { name: 'card', type: 10, value: 0 },
              { name: 'reverse', type: 5, value: true },
            ],
          },
        ],
      },
    ],
    [
      {
        name: 'search',
        type: 2,
        options: [
          {
            name: 'major-arcana',
            type: 1,
            options: [
              { name: 'card', type: 10, value: 21 },
              { name: 'reverse', type: 5, value: false },
            ],
          },
        ],
      },
    ],
  ],
];

const minorArcanaInputs = [
  [
    [
      {
        name: 'search',
        type: 2,
        options: [
          {
            name: 'minor-arcana',
            type: 1,
            options: [
              { name: 'suit', type: 3, value: 'wands' },
              { name: 'rank', type: 3, value: 'knight' },
              { name: 'reverse', type: 5, value: true },
            ],
          },
        ],
      },
    ],
    [
      {
        name: 'search',
        type: 2,
        options: [
          {
            name: 'minor-arcana',
            type: 1,
            options: [
              { name: 'suit', type: 3, value: 'swords' },
              { name: 'rank', type: 3, value: '1' },
              { name: 'reverse', type: 5, value: false },
            ],
          },
        ],
      },
    ],
    [
      {
        name: 'search',
        type: 2,
        options: [
          {
            name: 'minor-arcana',
            type: 1,
            options: [
              { name: 'suit', type: 3, value: 'pentacles' },
              { name: 'rank', type: 3, value: 'queen' },
              { name: 'reverse', type: 5, value: true },
            ],
          },
        ],
      },
    ],
    [
      {
        name: 'search',
        type: 2,
        options: [
          {
            name: 'minor-arcana',
            type: 1,
            options: [
              { name: 'suit', type: 3, value: 'cups' },
              { name: 'rank', type: 3, value: 'king' },
              { name: 'reverse', type: 5, value: false },
            ],
          },
        ],
      },
    ],
  ],
];

describe('Tarot', () => {
  const helper = new CommandTestHelper(new TarotCommand());

  beforeEach(() => {
    helper.resetInput();
    jest.restoreAllMocks();
  });

  describe.each(drawInputs)('draw', (input) => {
    beforeEach(() => {
      helper.setInput(input);
    });

    it('should not throw an error', async () => {
      await helper.executeWithoutError();
    });

    it('should call InteractionUtils.send', async () => {
      await helper.executeInstance();
      helper.expectSend();
    });
  });

  describe('search', () => {
    describe.each(majorArcanaInputs)('major-arcana', (input) => {
      beforeEach(() => {
        helper.setInput(input);
      });

      it('should not throw an error', async () => {
        await helper.executeWithoutError();
      });

      it('should call InteractionUtils.send', async () => {
        await helper.executeInstance();
        helper.expectSend();
      });
    });
    describe.each(minorArcanaInputs)('minor-arcana', (input) => {
      beforeEach(() => {
        helper.setInput(input);
      });

      it('should not throw an error', async () => {
        await helper.executeWithoutError();
      });

      it('should call InteractionUtils.send', async () => {
        await helper.executeInstance();
        helper.expectSend();
      });
    });
  });
});
