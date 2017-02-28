const webpackConfig = require('./webpack.config');
const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = (() => {
  return{
    entry: webpackConfig.entry,
    output: {
      path: webpackConfig.output.path,
      publicPath: webpackConfig.output.path,
      filename: '[name].[hash].js',
      chunkFilename: '[name].[chunkhash].js'
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
    new webpack.LoaderOptionsPlugin({
      test: /\.scss$/,
      debug: true,
      options: {
        postcss: function () {
          return [precss, autoprefixer];
        },
        context: path.join(__dirname, 'src'),
        output: {
          path: path.join(__dirname, 'dist')
        }
      }
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new ExtractTextPlugin("assets/styles.css"),
    new HtmlWebpackPlugin({
      hash: false,
      template: './src/index.html'
    }),
  ]
});

module.exports = config();