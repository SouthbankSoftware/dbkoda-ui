/**
 * @flow
 *
 * @Author: Chris Trott <christrott>, Guan Gui <guiguan>
 * @Date:   2017-07-21T09:27:03+10:00
 * @Email:  chris@southbanksoftware.com, root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-06-25T19:40:43+10:00
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
import util from 'util';

export default class Config {
  path: string;
  @observable settings: *;

  constructor() {
    this.path = global.PATHS.configPath;

    l.info(`config path: ${this.path}`);

    this._watchConfigErrors();
    this._watchConfigChanges();
  }

  _watchConfigErrors = () => {
    featherClient().configService.on('error', ({ payload: { error, level } }) => {
      this._handleError(error, level, false);
    });
  };

  _watchConfigChanges = () => {
    featherClient().configService.on(
      'changed',
      action(changed => {
        _.forEach(changed, (v, k) => {
          _.set(this.settings, k, v.new);
        });

        l.debug('Config has been changed', changed);
        this._showToaster('Config has been successfully updated', 'info');
      })
    );
  };

  _showToaster = (message: string, level: 'error' | 'warn' | 'info' = 'error') => {
    let className;
    let icon;

    if (level === 'error') {
      className = 'danger';
      icon = 'thumbs-down';
    } else if (level === 'warn') {
      className = 'warning';
      icon = 'thumbs-down';
    } else {
      className = 'success';
      icon = 'thumbs-up';
    }

    NewToaster.show({
      message,
      className,
      icon
    });
  };

  _handleError = (
    error: FeathersError,
    level: 'error' | 'warn' = 'error',
    logError: boolean = true
  ) => {
    if (logError) {
      l[level](error);
    }

    this._showToaster(util.format(error.message, error.errors || ''), level);
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

          l.debug('config loaded');
        })
      )
      .catch(err => {
        err.message = `Failed to load initial config: ${err.message}`;
        this._handleError(err);
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
        err.message = `Failed to patch config: ${err.message}`;
        this._handleError(err);
      });
  };
}
