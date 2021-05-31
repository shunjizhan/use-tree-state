const path = require('path');
const CleanTerminalPlugin = require('clean-terminal-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, './src/index.js'),
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'use-tree-state.bundle.js',
    library: 'use-tree-state',    // to be available in global scope
    libraryTarget: 'umd',
  },
  resolve: {
    // our code can resolve 'xxx' instead of writing 'xxx.jsx'
    extensions: ['*', '.js', '.jsx', '.mjs'],
    alias: {      // to prevent the multiple react problem
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
    },
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
    // new BundleAnalyzerPlugin(),
  ],
  externals: {
    // this is needed for react to resolve to a single react
    react: 'umd react',
    'react-dom': 'umd react-dom',
  },
};
