/**
 * @Last modified by:   guiguan
 * @Last modified time: 2018-07-04T16:38:07+10:00
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

// default logging API
global.l = {
  error: console.error,
  warn: console.warn,
  notice: console.log.bind(null, '%cNotice: ', 'color: green'),
  info: console.log,
  log: console.log,
  debug: console.log.bind(null, '%cDebug: ', 'color: blue')
};

// defaults for webpack
global.VERSION = '';
global.IS_STORYBOOK = false;

global.IS_PRODUCTION = process.env.NODE_ENV === 'production';
global.IS_DEVELOPMENT = !IS_PRODUCTION;
global.IS_TEST = process.env.NODE_ENV === 'test';
global.IS_ELECTRON = _.has(window, 'process.versions.electron');
global.WINDOW_NAME = window.location.pathname === '/ui/' ? 'main' : 'performance';
global.IS_FEATHERS_READY = false;

if (IS_ELECTRON) {
  // fix the problem that process.platform is not available at start
  process.platform = window.require('os').platform();

  const { remote } = window.require('electron');

  global.UAT = remote.getGlobal('UAT');
  global.PATHS = remote.getGlobal('PATHS');
} else {
  global.UAT = false;

  if (!IS_TEST) {
    // eslint-disable-next-line no-undef
    global.PATHS = WEBPACK_PATHS;
  } else {
    global.PATHS = {};
  }
}

global.sendToMain = (channel, ...args) => {
  if (IS_ELECTRON) {
    const { ipcRenderer } = window.require('electron');

    ipcRenderer.send(channel, ...args);
  }
};

global.logToMain = (level, message, options) => global.sendToMain('log', level, message, options);

export const protocol = 'http://';
export const host = '127.0.0.1';

const _port = IS_ELECTRON && window.require('electron').remote.getGlobal('CONTROLLER_PORT');
export const port = typeof _port === 'number' ? _port : 3030;
export const url = protocol + host + ':' + port;
export const analytics = {
  development: 'UA-101162043-2',
  prod: 'UA-101162043-1'
};
