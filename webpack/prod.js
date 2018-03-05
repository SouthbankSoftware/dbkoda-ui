/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-11-20T14:07:16+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   wahaj
 * @Last modified time: 2018-03-05T12:46:21+11:00
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
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const GlobalizePlugin = require('globalize-webpack-plugin');
const commonGlobalizePluginOptions = require('./commonGlobalizePluginOptions');
const common = require('./common');

const ENABLE_SOURCE_MAP = true;

module.exports = merge(
  merge.strategy({
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
    devtool: ENABLE_SOURCE_MAP ? 'source-map' : false,
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production')
        }
      }),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'commons',
        filename: 'commons.js',
        chunks: ['main', 'performance']
      }),
      new ExtractTextPlugin('[name].css'),
      new OptimizeCssAssetsPlugin(),
      new UglifyJsPlugin({
        parallel: true,
        sourceMap: ENABLE_SOURCE_MAP,
        uglifyOptions: {
          ecma: 6,
          compress: true,
          output: {
            comments: false,
            beautify: false
          }
        }
      }),
      new GlobalizePlugin(
        merge(commonGlobalizePluginOptions, {
          // because of statical extraction, we need to change our way of using Globalize in order
          // to enable this
          production: false
        })
      )
    ]
  })
);
