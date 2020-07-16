const path = require('path');

const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const fixturesDir = path.resolve(__dirname, '..', 'fixtures');

const getCompiler = () => {
  const compiler = webpack({
    context: fixturesDir,
    mode: 'production',
    entry: path.resolve(fixturesDir, 'dummy-entry'),
    output: {
      path: path.resolve(fixturesDir, 'dist'),
    },
    plugins: [
      new CleanWebpackPlugin({}),
    ],
  });

  return compiler;
};

module.exports = getCompiler;
