const path = require('path');
const CleanTerminalPlugin = require('clean-terminal-webpack-plugin');

const devOptions = {
  mode: 'development',
  devtool: 'inline-source-map',
  watchOptions: {
    aggregateTimeout: 0, // debounce time for re-compile
    ignored: ['node_modules/**'],
  },
};

module.exports = {
  entry: path.resolve(__dirname, '../src/index.js'),
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'use-tree-state.dev.bundle.js',
  },
  resolve: {
    // our code can resolve 'xxx' instead of writing 'xxx.jsx'
    extensions: ['*', '.js', '.jsx'],
  },
  module: {
    // For every file that match regex in 'test', webpack pipes the code through to loaders
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [
    // clear terminal in each build
    new CleanTerminalPlugin(),
  ],
  ...devOptions,
};
