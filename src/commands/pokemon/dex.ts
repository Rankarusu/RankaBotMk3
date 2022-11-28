import {
  ApplicationCommandOptionType,
  ButtonStyle,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  EmbedField,
  PermissionsString,
} from 'discord.js';
import {
  Ability,
  Berry,
  ChainLink,
  EvolutionChain,
  EvolutionDetail,
  Item,
  MainClient,
  Move,
  Nature,
  Pokemon,
  PokemonAbility,
  PokemonSpecies,
  PokemonStat,
  PokemonType,
} from 'pokenode-ts';
import {
  APICommunicationError,
  ExtendedPaginationEmbed,
  PokemonAbilityNotFoundError,
  PokemonBerryNotFoundError,
  PokemonDamageRelations,
  PokemonItemNotFoundError,
  PokemonMoveNotFoundError,
  PokemonNotFoundError,
} from '../../models';
import { types } from '../../static/pokemonDamageRelations.json';
import {
  ClientUtils,
  EmbedUtils,
  InteractionUtils,
  StringUtils,
} from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

const typeEmoji = {
  normal: '<:GO_Normal:741995847222296649>',
  fighting: '<:GO_Fighting:741995847293599846>',
  flying: '<:GO_Flying:741995847272759317>',
  poison: '<:GO_Poison:741995847360839721>',
  ground: '<:GO_Ground:741995847339999283>',
  rock: '<:GO_Rock:741995847381680178>',
  bug: '<:GO_Bug:741995847109181542>',
  ghost: '<:GO_Ghost:741995847264370718>',
  steel: '<:GO_Steel:741995847352582294>',
  fire: '<:GO_Fire:741995847251787856>',
  water: '<:GO_Water:741995847423623188>',
  grass: '<:GO_Grass:741995847331610735>',
  electric: '<:GO_Electric:741995847331348531>',
  psychic: '<:GO_Psychic:741995847428079656>',
  ice: '<:GO_Ice:741995847369228318>',
  dragon: '<:GO_Dragon:741994332587819060>',
  dark: '<:GO_Dark:741995847302250506>',
  fairy: '<:GO_Fairy:741995847344193566>',
};
const typeColors = {
  normal: [168, 168, 120],
  fighting: [192, 48, 40],
  flying: [168, 144, 240],
  poison: [160, 64, 160],
  ground: [224, 192, 104],
  rock: [184, 160, 56],
  bug: [168, 184, 32],
  ghost: [112, 88, 152],
  steel: [184, 184, 208],
  fire: [240, 128, 48],
  water: [104, 144, 240],
  grass: [120, 200, 80],
  electric: [248, 208, 48],
  psychic: [248, 88, 136],
  ice: [152, 216, 216],
  dragon: [112, 56, 248],
  dark: [112, 88, 72],
  fairy: [238, 153, 172],
};
const natures = [
  'hardy',
  'lonely',
  'brave',
  'adamant',
  'naughty',
  'bold',
  'docile',
  'relaxed',
  'impish',
  'lax',
  'timid',
  'hasty',
  'serious',
  'jolly',
  'naive',
  'modest',
  'mild',
  'quiet',
  'bashful',
  'rash',
  'calm',
  'gentle',
  'sassy',
  'careful',
  'quirky',
];

const evoChainRegex = new RegExp(
  /https:\/\/pokeapi\.co\/api\/v2\/evolution-chain\/(\d+)\//i
);

export class DexCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'dex',
    description: 'get information about pokemon',
    dm_permission: true,
    options: [
      {
        name: 'pokemon',
        type: ApplicationCommandOptionType.Subcommand,
        description: 'search for a pokemon',
        options: [
          {
            name: 'pokemon-name',
            type: ApplicationCommandOptionType.String,
            description: 'the name or ID of a pokemon to search for',
            required: true,
            autocomplete: true,
          },
        ],
      },
      {
        name: 'ability',
        type: ApplicationCommandOptionType.Subcommand,
        description: 'search for a pokemon ability',
        options: [
          {
            name: 'name',
            type: ApplicationCommandOptionType.String,
            description: 'the name or ID of a pokemon ability to search for',
            required: true,
          },
        ],
      },
      {
        name: 'berry',
        type: ApplicationCommandOptionType.Subcommand,
        description: 'search for a berry',
        options: [
          {
            name: 'name',
            type: ApplicationCommandOptionType.String,
            description: 'the name or ID of a berry to search for',
            required: true,
          },
        ],
      },
      {
        name: 'item',
        type: ApplicationCommandOptionType.Subcommand,
        description: 'search for an item',
        options: [
          {
            name: 'name',
            type: ApplicationCommandOptionType.String,
            description: 'the name or ID of an item to search for',
            required: true,
          },
        ],
      },
      {
        name: 'move',
        type: ApplicationCommandOptionType.Subcommand,
        description: 'search for a move',
        options: [
          {
            name: 'name',
            type: ApplicationCommandOptionType.String,
            description: 'the name or ID of a move to search for',
            required: true,
          },
        ],
      },
      {
        name: 'nature',
        type: ApplicationCommandOptionType.Subcommand,
        description: 'search for a nature',
        options: [
          {
            name: 'name',
            type: ApplicationCommandOptionType.String,
            description: 'the name of the nature to search for',
            required: true,
            choices: natures.map((nature) => {
              return {
                name: nature,
                value: nature,
              };
            }),
          },
        ],
      },
      {
        name: 'pdr',
        type: ApplicationCommandOptionType.Subcommand,
        description:
          'find out what types are strong against the selected type(s)',
        options: [
          {
            name: 'type-1',
            type: ApplicationCommandOptionType.String,
            description: 'type',
            required: true,
            choices: Object.keys(types).map((type) => {
              return {
                name: type,
                value: type,
              };
            }),
          },
          {
            name: 'type-2',
            type: ApplicationCommandOptionType.String,
            description: 'type',
            required: false,
            choices: Object.keys(types).map((type) => {
              return {
                name: type,
                value: type,
              };
            }),
          },
        ],
      },
    ],
  };

  public usage = () => `
  ${this.mention('pokemon')} \`Mega Charizard X\`
  ${this.mention('abiliy')} \`pressure\`
  ${this.mention('berry')} \`enigma\`
  ${this.mention('item')} \`potion\`
  ${this.mention('move')} \`hyper-beam\`
  ${this.mention('nature')} \`adamant\`
  ${this.mention('pdr')} \`water\` \`fire\`
  `;

  public cooldown = ClientUtils.APICallCommandRateLimiter();

  public category: CommandCategory = CommandCategory.POKEMON;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  private api = new MainClient({
    cacheOptions: { maxAge: 24 * 60 * 60 * 1000 }, //cache requests for a day
  });

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const subCommand = interaction.options.getSubcommand();
    switch (subCommand) {
      case 'pokemon': {
        const name = interaction.options
          .getString('pokemon-name')
          .toLowerCase();
        let pokemon: Pokemon;
        let species: PokemonSpecies;
        let abilities: Ability[];
        let evoChain: EvolutionChain;
        try {
          pokemon = await this.api.pokemon.getPokemonByName(name);
          species = await this.api.pokemon.getPokemonSpeciesByName(
            pokemon.species.name
          );

          const evoChainIdStr = evoChainRegex.exec(species.evolution_chain.url);
          const evoChainId = parseInt(evoChainIdStr[1], 10);

          evoChain = await this.api.evolution.getEvolutionChainById(evoChainId);

          if (species.varieties.length > 1) {
            //create additional embeds for all forms
          }

          abilities = await Promise.all(
            pokemon.abilities.map(async (ability) => {
              const abi = await this.api.pokemon.getAbilityByName(
                ability.ability.name
              );
              return abi;
            })
          );
        } catch (error) {
          throw new PokemonNotFoundError();
        }
        const pages: EmbedBuilder[] = await this.createPages(
          pokemon,
          species,
          evoChain,
          abilities
        );

        const actionRow = this.createActionRow(pokemon.species.name);

        const paginatedEmbed = new ExtendedPaginationEmbed(interaction, pages, [
          actionRow,
        ]);

        paginatedEmbed.start();
        break;
      }
      case 'ability': {
        const name = interaction.options.getString('name');
        let ability: Ability;
        try {
          ability = await this.api.pokemon.getAbilityByName(name);
        } catch {
          throw new PokemonAbilityNotFoundError();
        }

        const embed = this.createAbilityEmbed(ability);
        await InteractionUtils.send(interaction, embed);
        break;
      }
      case 'berry': {
        const name = interaction.options.getString('name');
        let berry: Berry;
        let berryItem: Item;
        try {
          //the api expects the name of the berry without the name. For example "cheri" instead of "cheri-berry"
          const sanitizedBerryString = name
            .replaceAll(/berry/gi, '')
            .replaceAll('-', '')
            .trim();
          berry = await this.api.berry.getBerryByName(sanitizedBerryString);
          berryItem = await this.api.item.getItemByName(berry.item.name);
        } catch {
          throw new PokemonBerryNotFoundError();
        }
        const embed = this.createBerryEmbed(berry, berryItem);
        await InteractionUtils.send(interaction, embed);
        break;
      }
      case 'item': {
        const name = interaction.options.getString('name');
        let item: Item;
        try {
          item = await this.api.item.getItemByName(name);
        } catch (error) {
          throw new PokemonItemNotFoundError();
        }
        const embed = this.createItemEmbed(item);
        await InteractionUtils.send(interaction, embed);
        break;
      }
      case 'move': {
        const name = interaction.options.getString('name');
        let move: Move;
        try {
          move = await this.api.move.getMoveByName(name);
        } catch (error) {
          throw new PokemonMoveNotFoundError();
        }
        const embed = this.createMoveEmbed(move);
        await InteractionUtils.send(interaction, embed);
        break;
      }
      case 'nature': {
        const name = interaction.options.getString('name');
        let nature: Nature;
        try {
          nature = await this.api.pokemon.getNatureByName(name);
        } catch (error) {
          throw new APICommunicationError();
        }
        const embed = this.createNatureEmbed(nature);
        await InteractionUtils.send(interaction, embed);
        break;
      }
      case 'pdr': {
        const type1 = interaction.options.getString('type-1');
        const type2 = interaction.options.getString('type-2');
        const pdr = this.getDamageRelations([type1, type2]);
        const embed = this.createPDREmbed(pdr);
        await InteractionUtils.send(interaction, embed);
        break;
      }
    }
  }

  private async createPages(
    pokemon: Pokemon,
    species: PokemonSpecies,
    evoChain: EvolutionChain,
    abilities: Ability[]
  ) {
    const pages: EmbedBuilder[] = [];
    const baseEmbed = await this.createPokemonEmbed(pokemon, species, evoChain);
    pages.push(baseEmbed);

    const abilityEmbed = this.createPokemonAbilityPageEmbed(
      pokemon,
      species,
      abilities
    );
    pages.push(abilityEmbed);

    const pdr = this.getDamageRelations(
      this.resolvePokemonTypes(pokemon.types)
    );
    const pdrEmbed = this.createPDREmbedPage(pdr, pokemon, species);
    pages.push(pdrEmbed);

    if (species.varieties.length > 1) {
      const additionalFormsEmbed = this.createAdditionalFormsEmbed(
        pokemon,
        species
      );
      pages.push(additionalFormsEmbed);
    }
    return pages;
  }

  private async createPokemonEmbed(
    pokemon: Pokemon,
    species: PokemonSpecies,
    evoChain?: EvolutionChain
  ): Promise<EmbedBuilder> {
    const embed = new EmbedBuilder();
    const statField = this.getStatBlock(pokemon.stats);
    const abilityField = this.getAbilityBlock(pokemon.abilities);
    const typeField = this.getTypeBlock(pokemon.types);
    const heightWeightField = this.getHeightWeightBlock(
      pokemon.height,
      pokemon.weight
    );
    const evoChainField = await this.getEvoChainField(evoChain);

    const genus = species.genera.find(
      (entry) => entry.language.name === 'en'
    ).genus;
    //get the newest flavor text
    const reversedFlavorTextEntries = species.flavor_text_entries;
    reversedFlavorTextEntries.reverse();
    const flavorText = reversedFlavorTextEntries.find(
      (entry) => entry.language.name === 'en'
    ).flavor_text;

    embed.setTitle(
      `#${species.id.toString().padStart(3, '0')} ${StringUtils.toTitleCase(
        pokemon.name.replaceAll('-', ' ')
      )}`
    );
    embed.setDescription(`**${genus}**\n\n${flavorText}`);
    embed.addFields([
      typeField,
      abilityField,
      heightWeightField,
      evoChainField,
      statField,
    ]);
    embed.setThumbnail(pokemon.sprites.front_default);
    embed.setColor(typeColors[pokemon.types[0].type.name]);
    embed.setFooter({ text: 'Powered by the PokéAPI via Pokenode.ts' });
    return embed;
  }

  private getStatBlock(stats: PokemonStat[]): EmbedField {
    const strStats = stats.map((stat) => {
      return stat.base_stat.toString();
    });
    const row1 = `__\`${'HP'.padEnd(8)}${'Atk'.padEnd(8)}Def\`__`;
    const row2 = `\`${strStats[0].padEnd(8)}${strStats[1].padEnd(
      8
    )}${strStats[2].padEnd(3)}\``;
    const row3 = `__\`${'Sp.Atk'.padEnd(8)}${'Sp.Def'.padEnd(8)}Spe\`__`;
    const row4 = `\`${strStats[3].padEnd(8)}${strStats[4].padEnd(
      8
    )}${strStats[5].padEnd(3)}\``;

    const statBlock = [row1, row2, row3, row4].join('\n');
    const total = stats.reduce((acc, stat) => acc + stat.base_stat, 0);
    return {
      name: `Stats (Total: ${total})`,
      value: statBlock,
      inline: false,
    };
  }

  private getAbilityBlock(abilities: PokemonAbility[]): EmbedField {
    const abilityField: EmbedField = {
      name: 'Abilities',
      value: abilities
        .map((ability: PokemonAbility) => {
          return `${StringUtils.toTitleCase(ability.ability.name)}${
            ability.is_hidden ? ' (hidden)' : ''
          }`;
        })
        .join('\n'),
      inline: true,
    };
    return abilityField;
  }

  private getTypeBlock(pokemonTypes: PokemonType[]): EmbedField {
    const typeField: EmbedField = {
      name: 'Types',
      value: pokemonTypes
        .map((type: PokemonType) => {
          return `${typeEmoji[type.type.name]} ${StringUtils.toTitleCase(
            type.type.name
          )}`;
        })
        .join('\n'),
      inline: true,
    };
    return typeField;
  }

  private getHeightWeightBlock(height: number, weight: number): EmbedField {
    const heightStr = `${height / 10} m`;
    const weightStr = `${weight / 10} kg`;
    const heightWeightField: EmbedField = {
      name: 'Height and Weight',
      value: `${heightStr} / ${weightStr}`,
      inline: true,
    };
    return heightWeightField;
  }

  private createPokemonAbilityPageEmbed(
    pokemon: Pokemon,
    species: PokemonSpecies,
    abilities: Ability[]
  ): EmbedBuilder {
    const embed = new EmbedBuilder();
    embed.setTitle(
      `#${species.id.toString().padStart(3, '0')} ${StringUtils.toTitleCase(
        pokemon.name.replaceAll('-', ' ')
      )}: Abilities`
    );
    const fields: EmbedField[] = abilities.map((ability: Ability) => {
      let effect: string;
      if (ability.effect_entries.length > 0) {
        effect = ability.effect_entries.find((entry) => {
          return entry.language.name === 'en';
        }).short_effect;
      } else {
        effect = ability.flavor_text_entries.find((entry) => {
          return entry.language.name === 'en';
        }).flavor_text;
      }
      return {
        name: ability.names.find((abilityName) => {
          return abilityName.language.name === 'en';
        }).name,
        value: effect,
        inline: false,
      };
    });
    embed.setThumbnail(pokemon.sprites.front_default);
    embed.setColor(typeColors[pokemon.types[0].type.name]);
    embed.addFields(fields);
    embed.setFooter({ text: 'Powered by the PokéAPI via Pokenode.ts' });
    return embed;
  }

  private createPDREmbedPage(
    pokemonDamageRelations: PokemonDamageRelations,
    pokemon?: Pokemon,
    species?: PokemonSpecies
  ) {
    const embed = new EmbedBuilder();
    const fields = this.createPDRFields(pokemonDamageRelations);

    fields.unshift({
      name: `(${pokemonDamageRelations.types
        .map((type) => `${typeEmoji[type]} ${StringUtils.toTitleCase(type)}`)
        .join(' ')})`,
      value: '\u200B',
      inline: false,
    });

    embed.setTitle(
      `#${species.id.toString().padStart(3, '0')} ${StringUtils.toTitleCase(
        pokemon.name.replaceAll('-', ' ')
      )}: Strengths and Weaknesses`
    );

    if (pokemon) {
      embed.setThumbnail(pokemon.sprites.front_default);
    }

    embed.setColor(typeColors[pokemonDamageRelations.types[0]]);
    embed.addFields(fields.filter((field) => field.value !== ''));
    embed.setFooter({ text: 'Powered by the PokéAPI via Pokenode.ts' });
    return embed;
  }

  private createActionRow(name: string) {
    const actionRow = new ActionRowBuilder<ButtonBuilder>();
    const pokewikiButton = new ButtonBuilder()
      .setLabel('PokéWiki')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://www.pokewiki.de/${name}`);
    const bulbapediaButton = new ButtonBuilder()
      .setLabel('Bulbapedia')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://bulbapedia.bulbagarden.net/wiki/${name}`);
    actionRow.addComponents(pokewikiButton, bulbapediaButton);
    return actionRow;
  }

  private createAdditionalFormsEmbed(
    pokemon: Pokemon,
    species: PokemonSpecies
  ) {
    const embed = new EmbedBuilder();
    embed.setTitle(
      `#${species.id.toString().padStart(3, '0')} ${StringUtils.toTitleCase(
        pokemon.name.replaceAll('-', ' ')
      )}: Forms`
    );

    const forms = species.varieties
      .map(
        (variety) =>
          `• ${StringUtils.toTitleCase(
            variety.pokemon.name.replaceAll('-', ' ')
          )}`
      )
      .join('\n');
    const fields = [
      {
        name: '\u200B',
        value: forms,
        inline: false,
      },
    ];
    embed.setThumbnail(pokemon.sprites.front_default);
    embed.setColor(typeColors[pokemon.types[0].type.name]);
    embed.addFields(fields);
    embed.setFooter({ text: 'Powered by the PokéAPI via Pokenode.ts' });
    return embed;
  }

  private async getEvoChainField(evoChain: EvolutionChain) {
    let text = `**${StringUtils.toTitleCase(evoChain.chain.species.name)}**`;
    if (evoChain.chain.evolves_to.length > 0) {
      text += ` → `;
      text = await this.getChainLink(text, evoChain.chain.evolves_to);
    }
    return {
      name: 'Evolution Chain',
      value: text,
      inline: true,
    } as EmbedField;
  }

  private async getChainLink(text: string, evolves_to: ChainLink[]) {
    const res = await Promise.all(
      evolves_to.map(async (evo) => {
        if (evo.evolves_to.length > 0) {
          text += `**${StringUtils.toTitleCase(
            evo.species.name
          )}** (${await this.getChainLinkText(evo.evolution_details)}) → `;
          text = await this.getChainLink(text, evo.evolves_to);
          return text;
        } else {
          text += `**${StringUtils.toTitleCase(
            evo.species.name
          )}** (${await this.getChainLinkText(evo.evolution_details)}) `;
          return text;
        }
      })
    );
    return res.join('\n');
  }

  private async getChainLinkText(evoDetails: EvolutionDetail[]) {
    const output = await Promise.all(
      evoDetails.map(async (evoDetail) => {
        const trigger = await this.api.evolution.getEvolutionTriggerByName(
          evoDetail.trigger.name
        );

        let text = trigger.names.find(
          (entry) => entry.language.name === 'en'
        ).name;

        if (evoDetail.gender) {
          if (evoDetail.gender === 1) {
            text += ' (only ♀)';
          }
          if (evoDetail.gender === 2) {
            text += ' (only ♂)';
          }
        }
        if (evoDetail.held_item) {
          text += ` holding ${evoDetail.held_item.name.replaceAll('-', ' ')}`;
        }
        if (evoDetail.item) {
          text += `: ${StringUtils.toTitleCase(
            evoDetail.item.name.replaceAll('-', ' ')
          )}`;
        }
        if (evoDetail.known_move) {
          text += ` knowing ${evoDetail.known_move.name.replaceAll('-', ' ')}`;
        }
        if (evoDetail.known_move_type) {
          text += ` knowing a ${evoDetail.known_move_type.name}-type move`;
        }
        if (evoDetail.location) {
          text += ` in ${evoDetail.location.name.replaceAll('-', ' ')}`;
        }
        if (evoDetail.min_affection) {
          text += ` with at least ${evoDetail.min_affection} affection`;
        }
        if (evoDetail.min_beauty) {
          text += ` with at least ${evoDetail.min_beauty} beauty`;
        }
        if (evoDetail.min_happiness) {
          text += ` with at least ${evoDetail.min_happiness} happiness`;
        }
        if (evoDetail.min_level) {
          text += ` (${evoDetail.min_level})`;
        }
        if (evoDetail.needs_overworld_rain) {
          text += ` while it is raining`;
        }
        if (evoDetail.party_species) {
          text += ` with a ${evoDetail.party_species.name} in the party`;
        }
        if (evoDetail.party_type) {
          text += ` with a ${evoDetail.party_type.name}-type Pokémon in the party`;
        }
        if (evoDetail.relative_physical_stats !== null) {
          switch (evoDetail.relative_physical_stats) {
            case 1:
              text += ` with Atk > Def`;
              break;
            case -1:
              text += ` with Atk < Def`;
              break;
            case 0:
              text += ` with Atk = Def`;
          }
        }
        if (evoDetail.time_of_day) {
          text += ` during the ${evoDetail.time_of_day}`;
        }
        if (evoDetail.trade_species) {
          text += ` with ${evoDetail.trade_species.name}`;
        }
        if (evoDetail.turn_upside_down) {
          text += ` while turning the console upside down`;
        }
        return text;
      })
    );
    return output.join(', ');
  }

  private createAbilityEmbed(ability: Ability): EmbedBuilder {
    const name = ability.names.find((abilityName) => {
      return abilityName.language.name === 'en';
    }).name;

    const description = ability.effect_entries.find((entry) => {
      return entry.language.name === 'en';
    }).effect;

    const embed = EmbedUtils.infoEmbed(description, name);
    embed.setFooter({ text: 'Powered by the PokéAPI via Pokenode.ts' });
    return embed;
  }

  private createBerryEmbed(berry: Berry, item: Item): EmbedBuilder {
    const flavors: string[] = berry.flavors.map((flavor) => {
      return `${flavor.flavor.name}: ${flavor.potency}`;
    });
    const firmness = berry.firmness.name;
    const maxHarvest = berry.max_harvest;
    const size = berry.size;
    const smoothness = berry.smoothness;
    const soilDryness = berry.soil_dryness;

    const naturalGift = [
      `Type: ${
        typeEmoji[berry.natural_gift_type.name]
      } ${StringUtils.toTitleCase(berry.natural_gift_type.name)}`,
      `Power: ${berry.natural_gift_power}`,
    ];
    const name = item.names.find((itemName) => {
      return itemName.language.name === 'en';
    }).name;

    const effect = item.effect_entries[0].effect;
    const thumbnail = item.sprites.default;

    const fields = [
      {
        name: 'Natural Gift Information',
        value: naturalGift.join('\n'),
        inline: true,
      },
      {
        name: 'Flavors',
        value: flavors.join('\n'),
        inline: true,
      },
      {
        name: 'Other Information',
        value: `Firmness: ${firmness}
        Max Harvest: ${maxHarvest}
        Size: ${size}
        Smoothness: ${smoothness}
        Soil Dryness: ${soilDryness}`,
        inline: true,
      },
    ];

    const embed = new EmbedBuilder()
      .setDescription(effect)
      .setTitle(name)
      .setThumbnail(thumbnail)
      .setFooter({ text: 'Powered by the PokéAPI via Pokenode.ts' })
      .setColor(typeColors[berry.natural_gift_type.name])
      .addFields(fields);
    return embed;
  }

  private createItemEmbed(item: Item): EmbedBuilder {
    const name = item.names.find((itemName) => {
      return itemName.language.name === 'en';
    }).name;

    const description = item.effect_entries.find((entry) => {
      return entry.language.name === 'en';
    }).effect;

    const cost = item.cost.toString();
    const sprite = item.sprites.default;

    const attributes = item.attributes
      .map((attribute) => attribute.name)
      .join(', ');

    const fields: EmbedField[] = [
      {
        name: 'Cost',
        value: cost,
        inline: true,
      },
    ];
    if (attributes) {
      fields.push({
        name: 'Attributes',
        value: attributes,
        inline: true,
      });
    }
    const embed = EmbedUtils.infoEmbed(description, name, fields);
    embed.setThumbnail(sprite);
    embed.setFooter({ text: 'Powered by the PokéAPI via Pokenode.ts' });
    return embed;
  }

  private createMoveEmbed(move: Move): EmbedBuilder {
    const type = move.type.name;
    const name = move.names.find((moveName) => {
      return moveName.language.name === 'en';
    }).name;
    const accuracy = move.accuracy;
    const power = move.power;
    const pp = move.pp;
    const damageClass = move.damage_class.name;
    const description = move.effect_entries
      .find((entry) => {
        return entry.language.name === 'en';
      })
      .effect.replaceAll('$effect_chance', move.effect_chance?.toString());

    const embed = new EmbedBuilder()
      .setTitle(name)
      .setDescription(description)
      .setColor(typeColors[type])
      .addFields([
        {
          name: 'Type',
          value: `${typeEmoji[type]} ${StringUtils.toTitleCase(type)}`,
          inline: true,
        },
        {
          name: 'Category',
          value: StringUtils.toTitleCase(damageClass),
          inline: true,
        },
        {
          name: 'Stats',
          value: `Power: ${power}
          Accuracy: ${accuracy}
          PP: ${pp}`,
        },
      ])
      .setFooter({ text: 'Powered by the PokéAPI via Pokenode.ts' });

    return embed;
  }

  private createNatureEmbed(nature: Nature): EmbedBuilder {
    const name = nature.names.find((natureName) => {
      return natureName.language.name === 'en';
    }).name;

    let statChanges: string;
    if (nature.increased_stat && nature.decreased_stat) {
      statChanges = `↗ ${StringUtils.toTitleCase(
        nature.increased_stat.name.replaceAll('-', ' ')
      )}
      ↘ ${StringUtils.toTitleCase(
        nature.decreased_stat.name.replaceAll('-', ' ')
      )}`;
    } else {
      statChanges = 'None';
    }

    let flavorPreference: string;
    if (nature.likes_flavor && nature.hates_flavor) {
      flavorPreference = `likes: ${nature.likes_flavor.name}
      dislikes: ${nature.hates_flavor.name}`;
    } else {
      flavorPreference = 'None';
    }

    const fields: EmbedField[] = [
      {
        name: 'Stat Changes',
        value: statChanges,
        inline: true,
      },
      {
        name: 'Flavor Preferences',
        value: flavorPreference,
        inline: true,
      },
    ];
    const embed = EmbedUtils.infoEmbed(undefined, name, fields);
    embed.setFooter({ text: 'Powered by the PokéAPI via Pokenode.ts' });
    return embed;
  }

  private createPDREmbed(pokemonDamageRelations: PokemonDamageRelations) {
    const embed = new EmbedBuilder();
    const fields = this.createPDRFields(pokemonDamageRelations);
    embed.setTitle(
      `Effectivity of Moves against ${pokemonDamageRelations.types
        .map((type) => `${typeEmoji[type]} ${StringUtils.toTitleCase(type)}`)
        .join(' ')} Pokemon`
    );
    embed.setColor(typeColors[pokemonDamageRelations.types[0]]);
    embed.addFields(fields.filter((field) => field.value !== ''));
    embed.setFooter({ text: 'Powered by the PokéAPI via Pokenode.ts' });
    return embed;
  }

  private resolvePokemonTypes(pokemonTypes: PokemonType[]): string[] {
    return pokemonTypes.map((type) => type.type.name);
  }

  private getDamageRelations(pokemonTypes: string[]): PokemonDamageRelations {
    let type1: string;
    let type2: string;
    if (pokemonTypes.length === 1) {
      type1 = pokemonTypes[0];
    } else {
      type1 = pokemonTypes[0];
      type2 = pokemonTypes[1];
    }

    const damageRelations = {
      types: type2 ? [type1, type2] : [type1],
      x4: [],
      x2: [],
      x1: [],
      x05: [],
      x025: [],
      x0: [],
    };
    if (type2) {
      Object.keys(types[type1]).forEach((type) => {
        const res = types[type1][type] * types[type2][type];
        switch (res) {
          case 4: {
            damageRelations.x4.push(type);
            break;
          }
          case 2: {
            damageRelations.x2.push(type);
            break;
          }
          case 1: {
            damageRelations.x1.push(type);
            break;
          }
          case 0.5: {
            damageRelations.x05.push(type);
            break;
          }
          case 0.25: {
            damageRelations.x025.push(type);
            break;
          }
          case 0: {
            damageRelations.x0.push(type);
            break;
          }
        }
      });
    } else {
      Object.keys(types[type1]).forEach((type) => {
        const res = types[type1][type];
        switch (res) {
          case 4: {
            damageRelations.x4.push(type);
            break;
          }
          case 2: {
            damageRelations.x2.push(type);
            break;
          }
          case 1: {
            damageRelations.x1.push(type);
            break;
          }
          case 0.5: {
            damageRelations.x05.push(type);
            break;
          }
          case 0.25: {
            damageRelations.x025.push(type);
            break;
          }
          case 0: {
            damageRelations.x0.push(type);
            break;
          }
        }
      });
    }

    return damageRelations;
  }

  private createPDRFields(
    pokemonDamageRelations: PokemonDamageRelations
  ): EmbedField[] {
    const fields: EmbedField[] = [];

    if (pokemonDamageRelations.x4.length > 0) {
      fields.push({
        name: 'Super Effective (x4)',
        value: `${pokemonDamageRelations.x4
          .map((type) => {
            return `${typeEmoji[type]} ${StringUtils.toTitleCase(type)}`;
          })
          .join('\n')}`,
        inline: false,
      });
    }
    if (pokemonDamageRelations.x2.length > 0) {
      fields.push({
        name: 'Super Effective (x2)',
        value: `${pokemonDamageRelations.x2
          .map((type) => {
            return `${typeEmoji[type]} ${StringUtils.toTitleCase(type)}`;
          })
          .join('\n')}`,
        inline: false,
      });
    }
    if (pokemonDamageRelations.x1.length > 0) {
      fields.push({
        name: 'Neutral (x1)',
        value: `${pokemonDamageRelations.x1
          .map((type) => {
            return `${typeEmoji[type]} ${StringUtils.toTitleCase(type)}`;
          })
          .join('\n')}`,
        inline: false,
      });
    }
    if (pokemonDamageRelations.x05.length > 0) {
      fields.push({
        name: 'Not Very Effective (x0.5)',
        value: `${pokemonDamageRelations.x05
          .map((type) => {
            return `${typeEmoji[type]} ${StringUtils.toTitleCase(type)}`;
          })
          .join('\n')}`,
        inline: false,
      });
    }
    if (pokemonDamageRelations.x025.length > 0) {
      fields.push({
        name: 'Not Very Effective (x0.25)',
        value: `${pokemonDamageRelations.x025
          .map((type) => {
            return `${typeEmoji[type]} ${StringUtils.toTitleCase(type)}`;
          })
          .join('\n')}`,
        inline: false,
      });
    }
    if (pokemonDamageRelations.x0.length > 0) {
      fields.push({
        name: 'No Effect (x0)',
        value: `${pokemonDamageRelations.x0
          .map((type) => {
            return `${typeEmoji[type]} ${StringUtils.toTitleCase(type)}`;
          })
          .join('\n')}`,
        inline: false,
      });
    }
    return fields;
  }
}
