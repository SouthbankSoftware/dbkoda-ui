const webpackConfig = require('./webpack.config');
const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = (() => {
  return{
    entry: './src/index.jsx',
    output: {
      path: './dist',
      publicPath: './',
      filename: 'js/[name].[hash].js',
      chunkFilename: 'js/[name].[chunkhash].js'
    },
    devtool: 'cheap-module-source-map',
    plugins: getPlugins(),
    module: webpackConfig.module,
  }
});

const getPlugins = (()=>{
  return [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(true),
    new webpack.NamedModulesPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'chunk',
      minChunks: Infinity
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new ExtractTextPlugin({
      filename: "styles/bundle.css",
      disable: false,
      allChunks: true
    }),
    new HtmlWebpackPlugin({
      hash: false,
      template: './src/index.html'
    }),
  ]
});

module.exports = config();