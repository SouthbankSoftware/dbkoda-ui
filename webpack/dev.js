/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-11-15T14:25:29+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-03T22:30:58+10:00
 *
 * dbKoda - a modern, open source code editor, for MongoDB.
 * Copyright (C) 2017-2018 Southbank Software
 *
 * This file is part of dbKoda.
 *
 * dbKoda is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * dbKoda is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 */

const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const GlobalizePlugin = require('globalize-webpack-plugin');
const Jarvis = require('webpack-jarvis');
const commonGlobalizePluginOptions = require('./commonGlobalizePluginOptions');
const commonDefinePluginOptions = require('./commonDefinePluginOptions');
const common = require('./common');

module.exports = merge.strategy({
  'entry.main': 'prepend',
  'entry.performance': 'prepend',
  'module.rules': 'prepend',
  plugins: 'prepend'
})(common, {
  entry: {
    // activate HMR for React
    main: ['react-hot-loader/patch'],
    performance: ['react-hot-loader/patch']
  },
  devtool: 'source-map',
  devServer: {
    // enable HMR on the server
    hot: true,

    // match the output path
    contentBase: path.resolve(__dirname, '../dist'),

    // match the output `publicPath`
    publicPath: '/ui/',
    port: 3000,
    host: '0.0.0.0'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new Jarvis({
      port: 1337
    }),
    new webpack.DefinePlugin(
      merge(commonDefinePluginOptions, {
        // https://webpack.js.org/plugins/define-plugin/#feature-flags
        'process.env.NODE_ENV': JSON.stringify('development')
      })
    ),
    // enable HMR globally
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      filename: 'commons.js',
      chunks: ['main', 'performance']
    }),
    new GlobalizePlugin(
      merge(commonGlobalizePluginOptions, {
        production: false
      })
    )
  ]
});
