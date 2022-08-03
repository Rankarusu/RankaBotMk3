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
  MainClient,
  Pokemon,
  PokemonAbility,
  PokemonStat,
  PokemonType,
} from 'pokenode-ts';

import { EventData } from '../../models/event-data';
import { InteractionUtils, StringUtils } from '../../utils';
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

        const pokemon = await this.api.pokemon.getPokemonByName(name);
        const embed = this.createPokemonEmbed(pokemon);
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
}
