import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  EmbedField,
  PermissionsString,
} from 'discord.js';
import {
  Ability,
  Berry,
  Item,
  MainClient,
  Pokemon,
  PokemonAbility,
  PokemonStat,
  PokemonType,
} from 'pokenode-ts';

import { EventData } from '../../models/event-data';
import { EmbedUtils, InteractionUtils, StringUtils } from '../../utils';
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

export class DexCommand implements Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'dex',
    description: 'Get information about Pokemon',
    dm_permission: true,
    options: [
      {
        name: 'pokemon',
        type: ApplicationCommandOptionType.Subcommand,
        description: 'search for a pokemon',
        options: [
          {
            name: 'name',
            type: ApplicationCommandOptionType.String,
            description: 'the name or ID of a pokemon to search for',
            required: true,
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
    ],
  };

  // cooldown?: RateLimiter;
  public helpText = ``;

  public category: CommandCategory = CommandCategory.POKEMON;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  private api = new MainClient();

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const subCommand = interaction.options.getSubcommand();
    switch (subCommand) {
      case 'pokemon': {
        const name = interaction.options.getString('name');
        let pokemon: Pokemon;
        try {
          pokemon = await this.api.pokemon.getPokemonByName(name);
        } catch (error) {
          //pokenode throws an error when it can't find a pokemon
          InteractionUtils.sendError(
            data,
            "I couldn't find any PokéMon matching that name or ID."
          );
        }

        const embed = this.createPokemonEmbed(pokemon);
        InteractionUtils.send(interaction, embed);
      }
      case 'ability': {
        const name = interaction.options.getString('name');
        let ability: Ability;
        try {
          ability = await this.api.pokemon.getAbilityByName(name);
        } catch {
          InteractionUtils.sendError(
            data,
            `I couldn't find any abilities matching that name or ID. 
            
            **Note**: The API uses kebab-case for abilities.
            E.G if you want to find Bad Dreams, you would use 'bad-dreams'.
            There will be a point in the future where I will implement fuzzy search, but today is not the day.`
          );
        }

        const embed = this.createAbilityEmbed(ability);
        InteractionUtils.send(interaction, embed);
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
          console.log(sanitizedBerryString);
          berry = await this.api.berry.getBerryByName(sanitizedBerryString);
          berryItem = await this.api.item.getItemByName(berry.item.name);
        } catch {
          InteractionUtils.sendError(
            data,
            `I couldn't find any berries matching that name or ID.`
          );
        }
        const embed = this.createBerryEmbed(berry, berryItem);
        InteractionUtils.send(interaction, embed);
      }
    }
  }

  private createPokemonEmbed(pokemon: Pokemon): EmbedBuilder {
    const embed = new EmbedBuilder();
    const statField = this.getStatBlock(pokemon.stats);
    const abilityField = this.getAbilityBlock(pokemon.abilities);
    const typeField = this.getTypeBlock(pokemon.types);
    const heightWeightField = this.getHeightWeightBlock(
      pokemon.height,
      pokemon.weight
    );

    embed.setTitle(
      `#${pokemon.id.toString().padStart(3, '0')} ${StringUtils.toTitleCase(
        pokemon.name
      )}`
    );
    embed.addFields([typeField, abilityField, heightWeightField, statField]);
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
    return {
      name: 'Stats',
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

  private getTypeBlock(types: PokemonType[]): EmbedField {
    const typeField: EmbedField = {
      name: 'Types',
      value: types
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
}
