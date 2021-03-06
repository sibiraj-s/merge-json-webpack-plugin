const path = require('path');

const webpack = require('webpack');

const fixturesDir = path.resolve(__dirname, '..', 'fixtures');

const getCompiler = (outputOptions = {}) => {
  const compiler = webpack({
    context: fixturesDir,
    mode: 'production',
    entry: path.resolve(fixturesDir, 'dummy-entry'),
    output: {
      clean: true,
      path: path.resolve(fixturesDir, 'dist'),
      ...outputOptions,
    },
  });

  return compiler;
};

module.exports = getCompiler;
