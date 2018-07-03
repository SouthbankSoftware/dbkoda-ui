/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-06-29T11:46:22+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-07-03T11:51:29+10:00
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

/* eslint-disable */

/* States */

type ConfigPanelState = {
  currentMenu: 'Paths',
  // e.g. "config.mongo.docker.containerId": "hopeful_brattain"
  changes: ObservableMap<string, any>,
  // e.g. "config.mongo.docker.containerId": "please make sure the Docker container exists and is
  // running"
  errors: ObservableMap<string, string>
};

type Store = {
  // accessible global.store
  configPanel: Observable<ConfigPanelState> // this should be reset whenever upgrade happens
  // ...
};

type Config = {
  user: {
    id: ?string
  }
  // ...
};

type ConfigStore = {
  // accessible via global.configStore
  configYmlPath: string,
  config: Observable<Config>, // accessible via global.config
  configDefaults: Config,
  configSchema: *,
  load: () => Promise<void>,
  patch: (
    config: Config /* or a Config fragment */
  ) => Promise<{
    payload: {
      /* changes */
    }
  }>
};

/* Components */

<ConfigEntry
  type="path" // "file-input" | "text-input" | "switch"
  path="config.mongo.cmd"
  // whenever user requested a change to this config entry, and this change may or may not be
  // accepted by config service. This is mainly used to update other config entry ui components:
  // e.g. hide or unhide other field based on value of current one
  onChangeRequested={(newValue: any, oldValue: any): void => {}}
/>;
