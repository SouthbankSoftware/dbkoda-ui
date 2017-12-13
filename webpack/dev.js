/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-11-15T14:25:29+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2017-12-14T02:00:52+11:00
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
const commonGlobalizePluginOptions = require('./commonGlobalizePluginOptions');
const common = require('./common');

module.exports = merge.strategy({
  entry: 'prepend',
  'module.rules': 'prepend',
  plugins: 'prepend',
})(common, {
  entry: [
    // activate HMR for React
    'react-hot-loader/patch',
  ],
  devtool: 'source-map',
  devServer: {
    // enable HMR on the server
    hot: true,

    // match the output path
    contentBase: path.resolve(__dirname, '../dist'),

    // match the output `publicPath`
    publicPath: '/ui/',
    port: 3000,
    host: '0.0.0.0',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
    // enable HMR globally
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new GlobalizePlugin(
      merge(commonGlobalizePluginOptions, {
        production: false,
      }),
    ),
  ],
});
