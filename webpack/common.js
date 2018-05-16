/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-11-22T16:42:44+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   wahaj
 * @Last modified time: 2018-05-16T14:11:40+10:00
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
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  context: path.resolve(__dirname, '../src'),
  entry: {
    main: ['babel-polyfill', './index.jsx'],
    performance: ['babel-polyfill', './performance.jsx']
  },
  output: {
    path: path.resolve(__dirname, '../dist/ui/'),
    publicPath: '/ui/',
    filename: '[name].[hash].js'
  },
  module: {
    rules: [
      {
        test: /\.(jsx?)$/,
        exclude: /(node_modules|.tmp-globalize-webpack)/,
        use: ['babel-loader']
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        use: [
          'file-loader?hash=sha512&digest=hex&name=assets/[hash].[ext]',
          'image-webpack-loader?bypassOnDebug&optimizationLevel=7&interlaced=false'
        ]
      },
      {
        test: /\.(svg)$/i,
        use: [
          {
            loader: 'babel-loader'
          },
          {
            loader: 'react-svg-loader',
            query: {
              svgo: {
                plugins: [
                  {
                    removeTitle: false
                  }
                ],
                floatPrecision: 2
              }
            }
          }
        ]
      },
      {
        test: /\.(png|woff|eot|ttf|woff2)(\?.*$|$)/,
        loader: 'url-loader?limit=100000&mimetype=application/font-woff'
      },
      {
        test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader?name=images/[hash].[ext]'
      },
      {
        test: /\.handlebars|hbs$/,
        loader:
          'handlebars-loader?helperDirs[]=' + path.join(__dirname, '../src/helpers/handlebars')
      },
      {
        test: /node_modules\/JSONStream\/index\.js$/,
        use: ['shebang-loader', 'babel-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      handlebars: 'handlebars/dist/handlebars.js'
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: false,
      filename: 'index.html',
      template: './index.html',
      chunks: ['commons', 'main']
    }),
    new HtmlWebpackPlugin({
      hash: false,
      filename: 'performance.html',
      template: './index.html',
      chunks: ['commons', 'performance']
    })
  ],
  node: {
    fs: 'empty',
    module: 'empty'
  }
};
