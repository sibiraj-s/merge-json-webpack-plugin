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
> - Unreleased

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
