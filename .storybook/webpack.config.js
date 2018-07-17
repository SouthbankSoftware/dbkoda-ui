/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-05-23T12:13:42+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-07-05T14:32:15+10:00
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
const os = require('os');
const webpack = require('@storybook/core/node_modules/webpack');

const home = os.homedir();
const WEBPACK_PATHS = {
  configPath: path.resolve(home, '.dbKoda/config.yml'),
  profilesPath: path.resolve(home, '.dbKoda/profiles.yml'),
  stateStore: path.resolve(home, '.dbKoda/stateStore.json')
};

module.exports = {
  context: path.resolve(__dirname, '../src'),
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.handlebars|hbs$/,
        loader:
          'handlebars-loader?helperDirs[]=' + path.join(__dirname, '../src/helpers/handlebars')
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
    new webpack.DefinePlugin({
      WEBPACK_PATHS: JSON.stringify(WEBPACK_PATHS),
      IS_STORYBOOK: true
    })
  ]
};
