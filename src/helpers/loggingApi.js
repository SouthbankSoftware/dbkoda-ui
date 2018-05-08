/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-05-04T10:41:36+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-08T14:58:32+10:00
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
import util from 'util';

global.rg4js = null;
export let isRaygunEnabled = false; // eslint-disable-line
let cachedUserObj;

export const setUser = (user: { id: string }) => {
  const userObj = {
    identifier: user.id
  };

  if (global.rg4js) {
    global.rg4js('setUser', userObj);
  } else {
    cachedUserObj = userObj;
  }
};

export const sendError = (error: Error, options: { customData?: *, tags?: * }) => {
  const { customData, tags } = options || {};

  global.rg4js &&
    global.rg4js('send', {
      error,
      customData,
      tags
    });
};

let defaultTags;
let defaultPiggybackTags;

const initRaygun = (manualBoot = true) => {
  global.rg4js = require('raygun4js');

  // NOTE: this is not a global variable but a placeholder string that will be replaced by webpack
  // DefinePlugin. The API_KEY is retrieved automatically from package.json at the building time of
  // ui bundle
  // $FlowFixMe
  global.rg4js('apiKey', API_KEY); // eslint-disable-line no-undef
  global.rg4js('enablePulse', true);
  // NOTE: this is not a global variable but a placeholder string that will be replaced by webpack
  // DefinePlugin. The VERSION is retrieved automatically from package.json at the building time of
  // ui bundle
  // $FlowFixMe
  global.rg4js('setVersion', VERSION); // eslint-disable-line no-undef
  global.rg4js('saveIfOffline', true);

  if (cachedUserObj) {
    global.rg4js('setUser', cachedUserObj);
    cachedUserObj = null;
  } else {
    setUser({ id: 'beforeConfigLoaded' });
  }

  global.rg4js('withTags', defaultTags);

  global.rg4js('onBeforeSend', payload => {
    if (isRaygunEnabled) {
      return payload;
    }

    return false;
  });

  global.rg4js('onBeforeSendRUM', payload => {
    if (isRaygunEnabled) {
      return payload;
    }

    return false;
  });

  manualBoot && global.rg4js('boot');
};

export const infoSymbol = Symbol.for('info');

const attachGlobalErrorEvents = () => {
  window.onerror = (message, _source, _lineno, _colno, error) => {
    l.error(error || message, {
      // $FlowFixMe
      [infoSymbol]: {
        tags: ['unhandled-exception']
      }
    });

    return true;
  };

  window.onunhandledrejection = event => {
    event.preventDefault();

    l.error(event.reason, {
      // $FlowFixMe
      [infoSymbol]: {
        tags: ['unhandled-rejection']
      }
    });
  };
};

export const toggleRaygun = (enabled: boolean, manualBoot: boolean = true) => {
  if (enabled) {
    isRaygunEnabled = true;

    // lazy init raygun
    if (!global.rg4js) {
      initRaygun(manualBoot);
    }
  } else {
    isRaygunEnabled = false;
  }
};

export const initLoggingApi = (tags: string[]) => {
  defaultPiggybackTags = tags.slice();
  defaultPiggybackTags.push('piggyback');

  tags.push(global.IS_PRODUCTION ? 'prod' : 'dev');
  global.UAT && tags.push('uat');
  defaultTags = tags;

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
          info.error.stack = info.error.stack.replace(
            /^.*/,
            `${info.error.constructor.name}: ${info.error.message}`
          );
        } else if (info.raygun !== false) {
          info.error = new Error(info.message);
        }

        // $FlowFixMe
        console._error(info.error);

        const usePiggyback = !isRaygunEnabled && info.raygun !== false;

        if (usePiggyback) {
          if (info.tags) {
            info.tags = [...defaultPiggybackTags, ...info.tags];
          } else {
            info.tags = defaultPiggybackTags;
          }
        }

        // piggyback error via main (dbkoda)
        logToMain('error', info.error.message, {
          usePiggyback,
          stack: info.error.stack,
          info: usePiggyback ? _.omit(info, ['message', 'error']) : undefined
        });

        if (isRaygunEnabled && info.raygun !== false) {
          sendError(info.error, info);
        }
      } else if (k === 'warn') {
        console.warn(...args);

        logToMain('warn', util.format(...args));
      } else if (k === 'notice') {
        console.log('%cNotice: ', 'color: green', ...args);

        logToMain('notice', util.format(...args));
      } else if (k === 'info') {
        console.log(...args);
      } else if (k === 'debug') {
        if (!IS_PRODUCTION) {
          console.log('%cDebug: ', 'color: blue', ...args);
        }
      }
    };
  });

  l._error = (...args) => {
    // $FlowFixMe
    l.error(...args, { [infoSymbol]: { raygun: false } });
  };

  // $FlowFixMe
  console.error = l.error;

  attachGlobalErrorEvents();
};
