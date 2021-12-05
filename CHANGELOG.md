# CHANGELOG

All notable changes to this project will be documented in this file.

> **Tags**
>
> - Features
> - Bug Fixes
> - Performance Improvements
> - Enhancements
> - Dependency Updates
> - Breaking Changes
> - Documentation
> - Internal
> - Refactor
> - Unreleased

## v6.1.0 (2021-08-18)

#### Bug Fixes

- update typings ([f58ffd3](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/f58ffd3))

#### Dependency Updates

- update schema-utils to v4 ([e6e3b4c](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/e6e3b4c))

## v6.0.0 (2021-08-18)

#### Features

- support array of globs via `groups[]pattern` ([8ffbb15](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/8ffbb15))

#### Dependency Updates

- update fast-glob to v3.2.7 ([b25ab9b](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/b25ab9b))
- update schema-utils to v3.1.1 ([b25ab9b](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/b25ab9b))

#### Breaking Changes

- renamed `group` to `groups` ([709351d](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/709351d))
- `groups[x]files` no longer support glob, use `pattern` instead ([8ffbb15](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/8ffbb15))
- drop nodejs v10, minimum required version `nodejs >=12.20.0` ([e214a52](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/e214a52))

## v5.1.0 (2021-03-06)

#### Dependency Updates

- update fast-glob to v3.2.5 ([63fcaf9](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/63fcaf9))

#### Refactor

- drop loader-utils dependency ([27d95e3](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/27d95e3))
- use modules provided by compiler ([7ec61db](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/7ec61db))

## v5.0.3 (2020-12-14)

#### Internal

- update LICENSE ([ce4a59c](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/ce4a59c))

## v5.0.2 (2020-12-01)

#### Bug Fixes

- update glob ignore pattern ([2ffff1f](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/2ffff1f))

## v5.0.1 (2020-11-10)

#### Bug Fixes

- allow concating arrays in json ([32d2d8c](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/32d2d8c))

## v5.0.0 (2020-11-09)

#### Refactor

- prefer `processAssets` hook ([17df72a](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/17df72a))

#### Breaking Changes

- rename `beforeEmit` option to `transform` ([b4ed32d](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/b4ed32d))

## v4.2.1 (2020-10-29)

#### Bug Fixes

- update typings ([67f081b](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/67f081b))

## v4.2.0 (2020-10-21)

#### Features

- add `force` option to overwrites files already in compilation.assets ([7a31a42](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/7a31a42))
- add `immutable` and `minimized` properties to output asset info ([c61e2c0](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/c61e2c0))

#### Bug Fixes

- don't overrite files already in compilation.assets ([7a31a42](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/7a31a42))

## v4.1.0 (2020-10-19)

#### Features

- support outputname interpolation ([112cb45](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/112cb45))

## v4.0.0 (2020-10-11)

#### Features

- support webpack 5 ([a59e062](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/a59e062))

#### Enhancements

- remove webpack-sources dependency ([a59e062](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/a59e062))

#### Breaking Changes

- drop webpack 4 support

## v3.0.0 (2020-10-06)

#### Dependency Updates

- update schema-utils to v3 ([39f2164](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/39f2164))
- update devDependencies ([7479e2b](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/7479e2b))

#### Breaking Changes

- minimum required Node.js version is `v10.13.0`
- minimum webpack version is `v4.40.0`

## v2.0.0 (2020-10-04)

#### Enhancements

- update options schema ([eade9d7](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/eade9d7))

#### Dependency Updates

- update dependencies ([ebd73e8](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/ebd73e8))
- update devDependencies ([a952880](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/a952880))

#### Breaking Changes

- rename option `root` to `cwd` ([e23f210](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/e23f210))

## v1.2.0 (2020-07-19)

#### Features

- add schema validation ([d6ea427](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/d6ea427))

## v1.1.1 (2020-07-14)

#### Bug Fixes

- use correct json returned from `beforeEmit` function ([87ad4da](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/87ad4da))

## v1.1.0 (2020-07-14)

#### Features

- add `beforeEmit` option ([c2c14db](https://github.com/sibiraj-s/merge-json-webpack-plugin/commit/c2c14db))

## v1.0.0 (2020-07-13)

- **Initial Release**: Webpack plugin to merge multiple json files into one
