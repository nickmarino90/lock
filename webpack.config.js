var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './src/browser.js',
  output: { path: __dirname + '/build', filename: 'lock.js' },
  resolve: {
    extensions: ["", ".webpack.js", ".web.js", ".js", ".jsx"]
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          plugins: ["version-inline", "transform-css-import-to-string"],
          presets: ["es2015-loose", "stage-0", "react"]
        }
      }
    ]
  },
};