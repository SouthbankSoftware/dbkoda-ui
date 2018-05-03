/**
 * @flow
 *
 * @Author: Chris Trott <christrott>
 * @Date:   2017-07-21T09:27:03+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-03T21:17:59+10:00
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
import { action, observable } from 'mobx';
import { featherClient } from '~/helpers/feathers';
import { NewToaster } from '#/common/Toaster';

export default class Config {
  path: string;
  @observable settings: *;

  constructor() {
    this.path = global.PATHS.configPath;

    logToMain('info', `config path: ${this.path}`);

    this._watchConfigChanges();
  }

  _watchConfigChanges = () => {
    featherClient().configService.on(
      'changed',
      action(changed => {
        _.forEach(changed, (v, k) => {
          _.set(this.settings, k, v.new);
        });

        sendToMain('configChanged', changed);

        logToMain('debug', 'config changed');
      })
    );
  };

  _handleError = (message: string) => {
    console.error(message);
    logToMain('error', message);
    NewToaster.show({
      message,
      className: 'danger',
      icon: 'thumbs-down'
    });
  };

  /**
   * Load settings from config service. This should ONLY be done once during initialisation
   */
  load = (): Promise<*> => {
    return featherClient()
      .configService.get('current')
      .then(
        action(({ payload }) => {
          // this will convert payload into new observable
          this.settings = payload;

          sendToMain('configLoaded', payload);

          logToMain('debug', 'config loaded');
        })
      )
      .catch(err => {
        this._handleError(`Failed to load initial config: ${err.message}`);
      });
  };

  /**
   * Update settings. This should be the ONLY way to update both ui and controller settings. After
   * this request, ui should receive a changed event which will in term update ui settings.
   */
  patch = (settings: {}) => {
    return featherClient()
      .configService.patch('current', {
        config: settings
      })
      .catch(err => {
        let message;

        if (err.errors) {
          message = JSON.stringify(err.errors);
        } else if (err.message) {
          message = err.message; // eslint-disable-line prefer-destructuring
        } else {
          message = String(err);
        }

        this._handleError(`Failed to update config: ${message}`);
      });
  };
}
