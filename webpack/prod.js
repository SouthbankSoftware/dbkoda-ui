/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-11-20T14:07:16+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2017-11-22T18:35:29+11:00
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

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const GlobalizePlugin = require('globalize-webpack-plugin');
const commonGlobalizePluginOptions = require('./commonGlobalizePluginOptions');
const common = require('./common');

module.exports = merge(
  merge.strategy({
    entry: 'prepend',
    'module.rules': 'prepend',
    plugins: 'prepend',
  })(common, {
    entry: [
      // Load Globalize so libraries can be built
      'globalize',
      'globalize/dist/globalize-runtime/number',
      'globalize/dist/globalize-runtime/currency',
      'globalize/dist/globalize-runtime/date',
      'globalize/dist/globalize-runtime/message',
      'globalize/dist/globalize-runtime/plural',
      'globalize/dist/globalize-runtime/relative-time',
      'globalize/dist/globalize-runtime/unit',
    ],
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: 'css-loader',
          }),
        },
        {
          test: /\.scss$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: ['css-loader', 'sass-loader'],
          }),
        },
      ],
    },
    devtool: 'source-map',
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production'),
        },
      }),
      new ExtractTextPlugin('style.css'),
      new UglifyJSPlugin({
        uglifyOptions: {
          beautify: false,
          ecma: 6,
          compress: true,
          comments: false,
        },
      }),
      new GlobalizePlugin(
        merge(commonGlobalizePluginOptions, {
          production: false,
        }),
      ),
    ],
  }),
);
