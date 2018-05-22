/**
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-22T10:44:50+10:00
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

import _ from 'lodash';
import * as d3 from 'd3';
import { initLoggingApi } from '~/helpers/loggingApi';

global.IS_PRODUCTION = process.env.NODE_ENV === 'production';
global.IS_DEVELOPMENT = !IS_PRODUCTION;
global.IS_TEST = process.env.NODE_ENV === 'test';
global.IS_ELECTRON = _.has(window, 'process.versions.electron');
global.WINDOW_NAME = window.location.pathname === '/ui/' ? 'main' : 'performance';

if (IS_ELECTRON) {
  // fix the problem that process.platform is not available at start
  process.platform = window.require('os').platform();

  const { remote } = window.require('electron');

  global.UAT = remote.getGlobal('UAT');
} else {
  global.UAT = false;
}

global.sendToMain = (channel, ...args) => {
  if (IS_ELECTRON) {
    const { ipcRenderer } = window.require('electron');

    ipcRenderer.send(channel, ...args);
  }
};

global.logToMain = (level, message, options) => global.sendToMain('log', level, message, options);

initLoggingApi(['dbkoda-ui', `window-${global.WINDOW_NAME}`]);

if (!IS_TEST) {
  const Globalize = require('globalize'); // doesn't work well with import

  global.Globalize = Globalize;

  const { language, region } = Globalize.locale().attributes;

  global.locale = `${language}-${region}`;

  d3.formatDefaultLocale(require(`d3-format/locale/${locale}.json`)); // eslint-disable-line import/no-dynamic-require

  global.globalString = (path, ...params) => Globalize.messageFormatter(path)(...params);
  global.globalNumber = (value, config) => Globalize.numberFormatter(config)(value);
}

export const protocol = 'http://';
export const host = '127.0.0.1';

const _port = IS_ELECTRON && window.require('electron').remote.getGlobal('CONTROLLER_PORT');
export const port = typeof _port === 'number' ? _port : 3030;
export const url = protocol + host + ':' + port;
export const analytics = {
  development: 'UA-101162043-2',
  prod: 'UA-101162043-1'
};
