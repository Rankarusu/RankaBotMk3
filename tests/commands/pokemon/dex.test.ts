/* eslint-disable @typescript-eslint/dot-notation */
import { PokemonClient } from 'pokenode-ts';
import { DexCommand } from '../../../src/commands';
import {
  APICommunicationError,
  ExtendedPaginationEmbed,
  PokemonAbilityNotFoundError,
  PokemonBerryNotFoundError,
  PokemonItemNotFoundError,
  PokemonMoveNotFoundError,
  PokemonNotFoundError,
} from '../../../src/models';
import { CommandTestHelper } from '../helper';

const validPokemonInputs = [
  [
    [
      {
        name: 'pokemon',
        type: 1,
        options: [{ name: 'pokemon-name', type: 3, value: 'bulbasaur' }],
      },
    ],
  ],
  [
    [
      {
        name: 'pokemon',
        type: 1,
        options: [{ name: 'pokemon-name', type: 3, value: 'charizard-mega-x' }],
      },
    ],
  ],
  [
    [
      {
        name: 'pokemon',
        type: 1,
        options: [{ name: 'pokemon-name', type: 3, value: 'pikachu' }],
      },
    ],
  ],
  [
    [
      {
        name: 'pokemon',
        type: 1,
        options: [{ name: 'pokemon-name', type: 3, value: 'snorlax-gmax' }],
      },
    ],
  ],
  [
    [
      {
        name: 'pokemon',
        type: 1,
        options: [{ name: 'pokemon-name', type: 3, value: 'marowak-alola' }],
      },
    ],
  ],
];

const invalidPokemonInput = [
  {
    name: 'pokemon',
    type: 1,
    options: [{ name: 'pokemon-name', type: 3, value: 'not_a_pokemon' }],
  },
];

const validAbilityInput = [
  {
    name: 'ability',
    type: 1,
    options: [{ name: 'name', type: 3, value: 'technician' }],
  },
];

const invalidAbilityInput = [
  {
    name: 'ability',
    type: 1,
    options: [{ name: 'name', type: 3, value: 'not_an_ability' }],
  },
];

const validBerryInput = [
  {
    name: 'berry',
    type: 1,
    options: [{ name: 'name', type: 3, value: 'enigma' }],
  },
];

const invalidBerryInput = [
  {
    name: 'berry',
    type: 1,
    options: [{ name: 'name', type: 3, value: 'not_a_berry' }],
  },
];

const validItemInput = [
  {
    name: 'item',
    type: 1,
    options: [{ name: 'name', type: 3, value: 'potion' }],
  },
];
const invalidItemInput = [
  {
    name: 'item',
    type: 1,
    options: [{ name: 'name', type: 3, value: 'not_an_item' }],
  },
];

const validMoveInput = [
  {
    name: 'move',
    type: 1,
    options: [{ name: 'name', type: 3, value: 'swords-dance' }],
  },
];
const invalidMoveInput = [
  {
    name: 'move',
    type: 1,
    options: [{ name: 'name', type: 3, value: 'not_a_move' }],
  },
];

const validNatureInput = [
  {
    name: 'nature',
    type: 1,
    options: [{ name: 'name', type: 3, value: 'adamant' }],
  },
];

const validPdrInput = [
  {
    name: 'pdr',
    type: 1,
    options: [
      { name: 'type-1', type: 3, value: 'steel' },
      { name: 'type-2', type: 3, value: 'psychic' },
    ],
  },
];

describe('Dex', () => {
  const helper = new CommandTestHelper(new DexCommand());
  ExtendedPaginationEmbed.prototype.start = jest.fn();

  beforeEach(() => {
    helper.resetInput();
    jest.restoreAllMocks();
  });

  describe('pokemon', () => {
    it('should throw an error if pokemon was not found', async () => {
      helper.setInput(invalidPokemonInput);
      await helper.executeWithError(new PokemonNotFoundError());
    });

    describe.each(validPokemonInputs)('valid inputs', (input) => {
      beforeEach(() => {
        helper.setInput(input);
      });

      it('should not throw an error on valid input', async () => {
        await helper.executeWithoutError();
      });

      it('should call start on valid input', async () => {
        await helper.executeInstance();
        expect(ExtendedPaginationEmbed.prototype.start).toHaveBeenCalled();
      });
    });
  });
  describe('ability', () => {
    it('should throw an error if ability was not found', async () => {
      helper.setInput(invalidAbilityInput);
      await helper.executeWithError(new PokemonAbilityNotFoundError());
    });

    it('should not throw an error on valid input', async () => {
      helper.setInput(validAbilityInput);
      await helper.executeWithoutError();
    });

    it('should call InteractionUtils.send on valid input', async () => {
      helper.setInput(validAbilityInput);
      await helper.executeInstance();
      helper.expectSend();
    });
  });
  describe('berry', () => {
    it('should throw an error if berry was not found', async () => {
      helper.setInput(invalidBerryInput);
      await helper.executeWithError(new PokemonBerryNotFoundError());
    });

    it('should not throw an error on valid input', async () => {
      helper.setInput(validBerryInput);
      await helper.executeWithoutError();
    });

    it('should call InteractionUtils.send on valid input', async () => {
      helper.setInput(validBerryInput);
      await helper.executeInstance();
      helper.expectSend();
    });
  });
  describe('item', () => {
    it('should throw an error if item was not found', async () => {
      helper.setInput(invalidItemInput);
      await helper.executeWithError(new PokemonItemNotFoundError());
    });

    it('should not throw an error on valid input', async () => {
      helper.setInput(validItemInput);
      await helper.executeWithoutError();
    });

    it('should call InteractionUtils.send on valid input', async () => {
      helper.setInput(validItemInput);
      await helper.executeInstance();
      helper.expectSend();
    });
  });
  describe('move', () => {
    it('should throw an error if move was not found', async () => {
      helper.setInput(invalidMoveInput);
      await helper.executeWithError(new PokemonMoveNotFoundError());
    });

    it('should not throw an error on valid input', async () => {
      helper.setInput(validMoveInput);
      await helper.executeWithoutError();
    });

    it('should call InteractionUtils.send on valid input', async () => {
      helper.setInput(validMoveInput);
      await helper.executeInstance();
      helper.expectSend();
    });
  });
  describe('nature', () => {
    it('should throw an error if nature call throws', async () => {
      helper.setInput(validNatureInput);
      jest
        .spyOn(PokemonClient.prototype, 'getNatureByName')
        .mockImplementationOnce(() => {
          throw new Error();
        });
      await helper.executeWithError(new APICommunicationError());
    });

    it('should not throw an error on valid input', async () => {
      helper.setInput(validNatureInput);
      await helper.executeWithoutError();
    });

    it('should call InteractionUtils.send on valid input', async () => {
      helper.setInput(validNatureInput);
      await helper.executeInstance();
      helper.expectSend();
    });
  });
  describe('pdr', () => {
    it('should not throw an error', async () => {
      helper.setInput(validPdrInput);
      await helper.executeWithoutError();
    });

    it('should call InteractionUtils.send', async () => {
      helper.setInput(validPdrInput);
      await helper.executeInstance();
      helper.expectSend();
    });
  });
});
