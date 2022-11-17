# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.3.2](https://github.com/Rankarusu/RankaBotMk3/compare/v1.3.1...v1.3.2) (2022-11-17)

### [1.3.1](https://github.com/Rankarusu/RankaBotMk3/compare/v1.3.0...v1.3.1) (2022-10-13)


### Bug Fixes

* **reddit:** fix bug where reddit command sends wrong amount of posts, also rename interfaces ([ee36b64](https://github.com/Rankarusu/RankaBotMk3/commit/ee36b64fcc3193a39268b75ae1938b09b957e8ed))
* **remind:** put reminder mention inside message instead of embed to actually ping ([0ff0d86](https://github.com/Rankarusu/RankaBotMk3/commit/0ff0d8695ff598212b1d3528791f5cfb1a4c51d7))

## [1.3.0](https://github.com/Rankarusu/RankaBotMk3/compare/v1.2.0...v1.3.0) (2022-10-03)


### Features

* **commands:** add rate limiter for commands that call an api or query the db ([cb6dcdb](https://github.com/Rankarusu/RankaBotMk3/commit/cb6dcdb750d35a77648ccb27e2c206cc5054c470))


### Bug Fixes

* **reddit:** fix handling of API-Errors ([c2b2dcd](https://github.com/Rankarusu/RankaBotMk3/commit/c2b2dcdf5b2a4fed4bde6bbbcce19e94bdf4e854))

## [1.2.0](https://github.com/Rankarusu/RankaBotMk3/compare/v1.1.0...v1.2.0) (2022-10-02)


### Features

* **database:** changed exp pk to composite pk ([c797bf4](https://github.com/Rankarusu/RankaBotMk3/commit/c797bf4e4e8384f1457101a2683c2b00343b804f))
* **exp:** add exp command to output personal evaluation and ranking ([37c8214](https://github.com/Rankarusu/RankaBotMk3/commit/37c821433b3ec99742fe190cfde2d2028fed9f1e))
* **exp:** add scheduler to remove orphaned users from the database ([f80ac26](https://github.com/Rankarusu/RankaBotMk3/commit/f80ac2638742825b87c40543da3dd8bc66e6572e))
* **exp:** added exp tracking trigger ([6480818](https://github.com/Rankarusu/RankaBotMk3/commit/64808184f43d1d4a20ca989e57ca0d64072e435b))

## 1.1.0 (2022-09-25)


### Features

* **bless command:** added bless command with pretty image ([e266e47](https://github.com/Rankarusu/RankaBotMk3/commit/e266e4731073dfe7ad3beba38713fbf0b6cc6b3f))
* **dice command:** added roll command ([f655145](https://github.com/Rankarusu/RankaBotMk3/commit/f6551450f23a1f8b08ada5759ef03db20759db03))


### Bug Fixes

* **hug,tarot:** fixed file path ([bf9d72a](https://github.com/Rankarusu/RankaBotMk3/commit/bf9d72a23f08eba8c529e9cf04b308ac92433841))
