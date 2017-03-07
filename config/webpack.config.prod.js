/**
 * @Author: guiguan
 * @Date:   2017-03-03T10:09:27+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-03-07T16:57:53+11:00
 */

const webpackConfig = require('./webpack.config');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const getPlugins = (() => {
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
      filename: 'styles/bundle.css',
      disable: false,
      allChunks: true
    }),
    new HtmlWebpackPlugin({
      hash: false,
      template: './src/index.html'
    }),
  ];
});

const config = (() => {
  return {
    entry: './src/index.jsx',
    output: {
      path: './dist',
      publicPath: './',
      filename: 'js/[name].[hash].js',
      chunkFilename: 'js/[name].[chunkhash].js'
    },
    resolve: {
      extensions: ['.js', '.jsx']
    },
    devtool: 'cheap-module-source-map',
    plugins: getPlugins(),
    module: webpackConfig.module,
  };
});

module.exports = config();
