var path = require('path');
var webpack = require("webpack");

module.exports = {
  entry: [ './src/App.js' ],

  output: {
    filename: 'build/bundle.js'
  },

  resolve: {
    root: [ path.resolve('./src'), path.resolve('../') ],
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        // exclude: /node_modules/,
        loaders:[ 'babel-loader' ]
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.png$/,
        loader:'file-loader?name=./build/[hash].[ext]'
      }, {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&mimetype=application/font-woff&name=./build/[hash].[ext]"
      }, {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&mimetype=application/font-woff&name=./build/[hash].[ext]"
      }, {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&mimetype=application/octet-stream&name=./build/[hash].[ext]"
      }, {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: "file?name=./build/[hash].[ext]"
      }, {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&mimetype=image/svg+xml&name=./build/[hash].[ext]"
      }
    ]
  }
};
