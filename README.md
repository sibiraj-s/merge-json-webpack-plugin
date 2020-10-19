# merge-json-webpack-plugin

[![Tests](https://github.com/sibiraj-s/merge-json-webpack-plugin/workflows/Tests/badge.svg)](https://github.com/sibiraj-s/merge-json-webpack-plugin/actions)
[![License](https://badgen.net/github/license/sibiraj-s/merge-json-webpack-plugin)](https://github.com/sibiraj-s/merge-json-webpack-plugin)
[![Version](https://badgen.net/npm/v/merge-json-webpack-plugin)](https://npmjs.com/merge-json-webpack-plugin)
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
          beforeEmit: (outputJson) => outputJson,
          to: 'manifest.json',
        },
        {
          files: '*.json', // glob. see https://github.com/mrmlnc/fast-glob
          to: 'merged-[contenthash].json',
        },
      ],
    }),
  ],
};
```

### Options

- **cwd**[`string`] - The directory, an absolute path, for resolving files. Defaults to webpack [context](https://webpack.js.org/configuration/entry-context/#context)

- **group**[`array`] - Files to merge and destination path

  - **files**[`array`] or [[glob](https://github.com/mrmlnc/fast-glob)] - The order of merge is not guarenteed when glob is used.
  - **beforeEmit**[`function`] - A function called before emitting the json. The return json value is written to the output file. If the function returns a promise, it will be awaited.
  - **to**[`string`]: Destination path to write the files to.

- **minify**[`boolean`] - Minify the output json. Enabled by default in production mode.

- **mergeFn**[`function`] - A function used to merge two objects. Default is `Object.assign`

```js
// webpack.config.js
const MergeJsonPlugin = require('merge-json-webpack-plugin');
const _ = require('loadsh');

const customizer = (objValue, srcValue) => {
  if (_.isArray(objValue)) {
    return objValue.concat(srcValue);
  }
}

const merge = (object, other) => {
  return _.mergeWith(object, other, customizer);
};

module.exports = {
  plugins: [
    new MergeJsonPlugin({
      mergeFn: merge,
    }),
    new MergeJsonPlugin({
      mergeFn: (prev, current) => Object.assign(prev, current),
    }),
  ],
};
```

- **globOptions[`GlobOptions`]** - Options to foward to `fast-glob` when glob is used otherwise ignored. See https://github.com/mrmlnc/fast-glob#options-3.
