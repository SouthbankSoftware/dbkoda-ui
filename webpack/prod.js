/**
 * @Last modified by:   guiguan
 * @Last modified time: 2017-06-09T06:36:28+10:00
 */

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const merge = require('webpack-merge');
const common = require('./common');

module.exports = merge.strategy({
  'module.rules': 'prepend',
  plugins: 'prepend'
})(common, {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      }
    ]
  },
  devtool: 'cheap-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new ExtractTextPlugin('style.css')
  ]
});
