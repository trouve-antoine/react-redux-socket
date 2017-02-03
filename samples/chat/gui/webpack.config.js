var path = require('path');
var webpack = require("webpack");

module.exports = {
  entry: [ './src/App.js' ],

  output: {
    filename: 'build/bundle.js'
  },

  devServer: {
    host: '0.0.0.0',
    port: 3001
  },

  resolve: {
    modules: [ path.resolve('./src'), path.resolve('./node_modules') ],
    alias: {
      "@common": path.resolve('../common'),
      "@src": path.resolve('./src')
    }
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /semantic-ui-css\/.*\.(woff|woff2|eot|png|ttf|svg)$/,
        loader: 'url-loader?limit=100000'
      }
    ]
  }
};
