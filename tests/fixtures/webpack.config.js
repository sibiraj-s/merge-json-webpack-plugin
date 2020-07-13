const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (options) => {
  const { plugins } = options;

  return {
    context: __dirname,
    mode: 'production',
    entry: path.resolve(__dirname, 'dummy-entry'),
    output: {
      path: path.resolve(__dirname, '..', 'dist'),
    },
    plugins: [
      new CleanWebpackPlugin(),
      ...plugins,
    ],
  };
};
