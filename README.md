# merge-json-webpack-plugin

[![Tests](https://github.com/sibiraj-s/merge-json-webpack-plugin/workflows/Tests/badge.svg)](https://github.com/sibiraj-s/merge-json-webpack-plugin/actions)
[![License](https://badgen.net/github/license/sibiraj-s/merge-json-webpack-plugin)](https://github.com/sibiraj-s/merge-json-webpack-plugin)
[![License](https://badgen.net/npm/v/merge-json-webpack-plugin)](https://npmjs.com/merge-json-webpack-plugin)
[![Node Version](https://badgen.net/npm/node/merge-json-webpack-plugin)](https://npmjs.com/merge-json-webpack-plugin)

> Webpack plugin to merge multiple json files into one

<p align="center">
  <a href="https://github.com/sibiraj-s/merge-json-webpack-plugin">
    <img width="200" height="200" src="./assets/webpack.png">
  </a>
</p>

## Getting Started

### Installation

```bash
npm i -D merge-json-webpack-plugin
# or
yarn add --dev merge-json-webpack-plugin
```

### Usage

```js
// webpack.config.js
const MergeJsonPlugin = require('merge-json-webpack-plugin');

module.exports = {
  plugins: [
    new MergeJsonPlugin({
      group: [
        {
          files: [
            'common-manifest.json',
            'firefox-manifest.json'
          ],
          to: 'manifest.json',
        },
        {
          files: '*.json', // glob. see https://github.com/mrmlnc/fast-glob
          to: 'merged.json',
        },
      ],
    }),
  ],
};
```

### Options

- **root** - The directory, an absolute path, for resolving files.

- **group** - files to merge and destination path

  - **files** - array of files or [glob](https://github.com/mrmlnc/fast-glob). The order of merge is not guarenteed when glob is used.
  - **to**: destination path to write the files to.

- **minify** - whether to minify the merged json. Enabled by default in production mode.

- **mergeFn** - a function used to merge two objects. defaults for `Object.assign`

```js
// webpack.config.js
const MergeJsonPlugin = require('merge-json-webpack-plugin');
const _ = require('loadsh');

module.exports = {
  plugins: [
    new MergeJsonPlugin({
      mergeFn: _.merge,
    }),
    new MergeJsonPlugin({
      mergeFn: (prev, current) => Object.assign(prev, current),
    }),
  ],
};
```

- **globOptions** - options to foward to `fast-glob` when glob is used, see https://github.com/mrmlnc/fast-glob#options-3.
