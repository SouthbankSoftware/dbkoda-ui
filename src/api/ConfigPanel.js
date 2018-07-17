/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-07-08T21:22:56+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-07-13T00:40:14+10:00
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
// $FlowFixMe
import { ObservableMap, action, reaction } from 'mobx';
import ConfigStore from '~/stores/config';
import { manifest } from '#/ConfigPanel';

const APPLY_CHANGES_DEBOUNCE_DELAY = 1500;

export type ConfigPanelState = {
  currentMenu: string,
  // e.g. "config.mongo.docker.containerId": "hopeful_brattain"
  changes: ObservableMap<string, any>,
  // e.g. "config.mongo.docker.containerId": "please make sure the Docker container exists and is
  // running"
  errors: ObservableMap<
    string,
    {
      message: string,
      asyncError?: boolean
    }
  >
};

export default class ConfigPanelApi {
  store: *;
  api: *;
  configStore: ConfigStore;

  constructor(store: *, api: *, configStore: ConfigStore) {
    this.store = store;
    this.api = api;
    this.configStore = configStore;

    reaction(
      () => [...this.store.configPanel.changes.entries()],
      entries => {
        if (entries.length === 0) return;

        const request = {};

        for (const [k, v] of entries) {
          _.set(request, k, v);
        }

        this.configStore.patch(request.config);
      },
      {
        fireImmediately: true,
        delay: APPLY_CHANGES_DEBOUNCE_DELAY
      }
    );
  }

  selectMenuEntry = action((entryName: string) => {
    if (entryName in manifest) {
      const { configPanel } = this.store;

      configPanel.currentMenuEntry = entryName;
    } else {
      l.debug(`ConfigPanel: menu entry \`${entryName}\` deosn't exist`);
    }
  });

  clearConfigError = action((path: ?string) => {
    const {
      configPanel: { errors }
    } = this.store;

    if (path) {
      for (const errPath of errors.keys()) {
        if (errPath.startsWith(path)) {
          errors.delete(errPath);
        }
      }
    } else {
      errors.clear();
    }
  });

  getConfigError = (path: string): string => {
    const {
      configPanel: { errors }
    } = this.store;

    const err = errors.get(path);

    if (err) return err.message;

    return '';
  };

  getCurrentConfigValue = (path: string): any => {
    const {
      configPanel: { changes }
    } = this.store;

    return changes.has(path) ? changes.get(path) : _.get(this.configStore, path);
  };

  setCurrentConfigValue = action((path: string, value: any) => {
    const {
      configPanel: { changes, errors }
    } = this.store;

    if (value == _.get(this.configStore, path)) {
      changes.delete(path);

      if (errors.has(path)) {
        this.clearConfigError();
      }
    } else {
      changes.set(path, value);
    }
  });
}
