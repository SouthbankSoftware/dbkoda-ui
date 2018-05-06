/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-05-04T10:41:36+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-04T23:20:22+10:00
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

import rg4js from 'raygun4js';
import _ from 'lodash';
import util from 'util';

global.rg4js;

export const setUser = (user: { id: string }) => {
  rg4js('setUser', {
    identifier: user.id
  });
};

export const sendError = (error: Error, options: { customData?: *, tags?: * }) => {
  const { customData, tags } = options || {};

  rg4js('send', {
    error,
    customData,
    tags
  });
};

export const infoSymbol = Symbol.for('info');

export const initLoggingApi = (defaultTags: string[]) => {
  if (!IS_TEST) {
    // NOTE: this is not a global variable but a placeholder string that will be replaced by webpack
    // DefinePlugin. The API_KEY is retrieved automatically from package.json at the building time of
    // ui bundle
    // $FlowFixMe
    rg4js('apiKey', API_KEY); // eslint-disable-line no-undef
    rg4js('enablePulse', true);
    // NOTE: this is not a global variable but a placeholder string that will be replaced by webpack
    // DefinePlugin. The VERSION is retrieved automatically from package.json at the building time of
    // ui bundle
    // $FlowFixMe
    rg4js('setVersion', VERSION); // eslint-disable-line no-undef
    rg4js('saveIfOffline', true);
    setUser({ id: 'beforeConfigLoaded' });

    defaultTags.push(global.IS_PRODUCTION ? 'prod' : 'dev');
    global.UAT && defaultTags.push('uat');

    rg4js('withTags', defaultTags);
  }

  // $FlowFixMe
  console._error = console.error;

  global.logger = global.l = {
    error: null,
    warn: null,
    notice: null,
    info: null,
    debug: null
  };

  _.forEach(l, (v, k) => {
    if (v) return;

    l[k] = (...args) => {
      if (k === 'error') {
        const results = [];
        let resultsWithErrors;
        const info = {};

        for (const arg of args) {
          const argType = typeof arg;
          let isIgnored = false;

          if (argType === 'object' && arg) {
            const c = arg[infoSymbol];

            if (c) {
              isIgnored = true;
              _.assign(info, c);
            }

            if (info.raygun !== false && arg instanceof Error) {
              isIgnored = true;

              if (!resultsWithErrors) {
                // lazy init
                resultsWithErrors = results.slice();
              }

              // shallow clone original error
              info.error = Object.create(
                Object.getPrototypeOf(arg),
                // $FlowFixMe
                Object.getOwnPropertyDescriptors(arg)
              );

              results.push(arg);
              resultsWithErrors.push(arg.message);
            }
          }

          if (!isIgnored) {
            results.push(arg);
            resultsWithErrors && resultsWithErrors.push(arg);
          }
        }

        // stringify input args
        // $FlowFixMe
        info.message = util.format(...results);

        if (info.error) {
          // $FlowFixMe
          info.error.message = util.format(...resultsWithErrors);
        } else if (info.raygun !== false) {
          info.error = new Error(info.message);
        }

        // $FlowFixMe
        console._error(info.message);
        logToMain('error', info.message);
        if (info.raygun !== false && !IS_TEST) {
          sendError(info.error, info);
        }
      } else if (k === 'notice') {
        console.log('%cNotice: ', 'color: green', ...args);
      } else if (k === 'debug') {
        if (!IS_PRODUCTION) {
          console.log('%cDebug: ', 'color: blue', ...args);
        }
      } else if (k === 'info') {
        console.log(...args);
      } else {
        console[k](...args);
      }
    };
  });

  l._error = (...args) => {
    // $FlowFixMe
    l.error(...args, { [infoSymbol]: { raygun: false } });
  };

  // $FlowFixMe
  console.error = l.error;
};
