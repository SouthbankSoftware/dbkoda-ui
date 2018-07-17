/**
 * @flow
 *
 * @Author: Chris Trott <christrott>, Guan Gui <guiguan>
 * @Date:   2017-07-21T09:27:03+10:00
 * @Email:  chris@southbanksoftware.com, root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-07-17T20:58:43+10:00
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
import { NavPanes } from '#/common/Constants';

export type Config = {};
export type ConfigSchema = {};

export default class ConfigStore {
  configYmlPath: string;
  @observable config: Config;
  @observable configDefaults: Config;
  @observable configSchema: ConfigSchema;

  constructor() {
    this.configYmlPath = global.PATHS.configPath;

    l.info(`config path: ${this.configYmlPath}`);

    this._watchForConfigErrorReset();
    this._watchForConfigError();
    this._watchForConfigChanged();
  }

  _watchForConfigErrorReset = () => {
    featherClient().configService.on(
      'errorReset',
      action(({ payload: { paths } }) => {
        for (const path of paths) {
          global.api.clearConfigError(path);
        }
      })
    );
  };

  _watchForConfigError = () => {
    featherClient().configService.on('error', ({ payload: { error, level } }) => {
      this._handleError(error, level, false);
    });
  };

  _watchForConfigChanged = () => {
    featherClient().configService.on(
      'changed',
      action(changed => {
        const {
          configPanel: { changes, errors }
        } = global.store;

        _.forEach(changed, (v, k) => {
          _.set(this, k, v.new);

          const wantedValue = changes.get(k);

          if (wantedValue === null || wantedValue == v.new) {
            changes.delete(k);
          }
        });

        for (const [k, v] of errors.entries()) {
          if (!v.asyncError) {
            errors.delete(k);
          }
        }

        l.debug('Config has been changed', changed);
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

  _handleError = action(
    (error: FeathersError, level: 'error' | 'warn' = 'error', logError: boolean = true) => {
      if (logError) {
        l[level](error);
      }

      if (!_.isEmpty(error.errors)) {
        const {
          configPanel: { errors }
        } = global.store;

        const asyncError = _.get(error, 'data.asyncError');

        if (asyncError && error.className === 'MongoConfigError') {
          // clear old Mongo async errors
          for (const [k, v] of errors.entries()) {
            if (v.asyncError && k.startsWith('config.mongo')) {
              errors.delete(k);
            }
          }

          // open PathsConfigPanel
          global.store.configPanel.currentMenuEntry = 'paths';
          global.store.setActiveNavPane(NavPanes.CONFIG);
        }

        _.forEach(error.errors, (v, k) => {
          if (k.startsWith('config.')) {
            const err = {
              message: v
            };

            if (asyncError) {
              // $FlowFixMe
              err.asyncError = true;
            }

            errors.set(k, err);
          } else {
            this._showToaster(util.format(error.message, k, v), level);
          }
        });
      } else {
        this._showToaster(error.message, level);
      }
    }
  );

  /**
   * Load settings from config service. This should ONLY be done once during initialisation
   */
  load = (): Promise<void> => {
    return featherClient()
      .configService.get('current')
      .then(
        action(({ payload: { config, configDefaults, configSchema } }) => {
          // this will convert payload into new observable
          this.config = config;
          global.config = this.config;

          this.configDefaults = configDefaults;
          this.configSchema = configSchema;

          sendToMain('configLoaded', config);

          l.debug('Config loaded');
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
  patch = (config: Config): Promise<void> => {
    l.debug('Patching config...');

    return featherClient()
      .configService.patch('current', {
        config
      })
      .catch(err => {
        err.message = `Failed to patch config: ${err.message}`;
        this._handleError(err);
      });
  };
}
