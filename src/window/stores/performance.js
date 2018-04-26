/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-02-27T15:17:00+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-04-27T09:07:03+10:00
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
import { observable, action, runInAction } from 'mobx';
import { restore } from 'dumpenvy';
import { deserializer, postDeserializer } from '#/common/mobxDumpenvyExtension';
import { ProfilingConstants, NavPanes } from '#/common/Constants';
import { handleNewData, attachToMobx } from '~/api/PerformancePanel';

const electron = window.require('electron');
const { ipcRenderer } = electron;

const Globalize = require('globalize'); // doesn't work well with import
// Globalize Configuration for Performance Window
global.Globalize = Globalize;
const { language, region } = Globalize.locale().attributes;
global.locale = `${language}-${region}`;
global.globalString = (path, ...params) => Globalize.messageFormatter(path)(...params);
global.globalNumber = (value, config) => Globalize.numberFormatter(config)(value);

global.config = null;

class PerformanceWindowApi {
  store = null;
  constructor(store) {
    this.store = store;
  }
  profileId = null;
  setProfileId(id) {
    this.profileId = id;
  }
  @action.bound
  sendCommandToMainProcess = (command, params) => {
    ipcRenderer.send('performance', {
      command,
      profileId: this.profileId,
      ...params
    });
  };

  @action.bound
  resetHighWaterMark = () => {
    this.sendCommandToMainProcess('pw_resetHighWaterMark');
  };

  @action.bound
  resetPerformancePanel = () => {
    this.sendCommandToMainProcess('pw_resetPerformancePanel');
  };

  @action.bound
  openStorageDDView = () => {
    this.sendCommandToMainProcess('pw_openStorageDDView');
  };

  @action.bound
  getTopConnections = () => {
    this.store.topConnectionsPanel.payload = null;
    this.store.topConnectionsPanel.selectedConnection = null;
    this.store.topConnectionsPanel.operations = null;
    this.store.topConnectionsPanel.selectedOperation = null;
    this.store.topConnectionsPanel.highWaterMarkConnection = null;
    this.sendCommandToMainProcess('pw_getTopConnections');
  };

  @action.bound
  killSelectedOperation = () => {
    const { selectedConnection, selectedOperation } = this.store.topConnectionsPanel;
    if (selectedOperation) {
      const { opId } = selectedOperation;
      this.sendCommandToMainProcess('pw_killOperation', { opId });
      const ops = _.omit(selectedConnection.ops, opId);
      selectedConnection.ops = ops;
      this.store.topConnectionsPanel.operations = ops;
    }
  };

  @action.bound
  getProfilingDataBases = () => {
    console.log('getProfilingDataBases');
    this.store.profilingPanel.enabledDatabases = [];
    this.store.profilingPanel.selectedDatabase = null;
    this.sendCommandToMainProcess('pw_getProfilingDataBases');
  };

  @action.bound
  getProfilingData = database => {
    this.store.profilingPanel.payload = null;
    this.sendCommandToMainProcess('pw_getProfilingData', { database });
  };

  @action.bound
  setProfilingDatabaseConfiguration = configs => {
    console.log('send profiling database configuration ', configs);
    this.sendCommandToMainProcess('pw_setProfilingDatabseConfiguration', {
      configs
    });
  };

  @action.bound
  showToaster(toasterObj) {
    if (this.store && this.store.toasterCallback) {
      this.store.toasterCallback(toasterObj);
    }
  }
}

export default class Store {
  config = null;
  api = null;
  @observable.shallow performancePanel = null;
  @observable profileId = null;
  @observable
  topConnectionsPanel = observable.object(
    {
      payload: null,
      selectedConnection: null,
      operations: null,
      selectedOperation: null,
      highWaterMarkConnection: null
    },
    null,
    { deep: false }
  );

  @observable
  profilingPanel = observable.object(
    {
      enabledDatabases: [],
      selectedDatabase: null,
      payload: null
    },
    null,
    { deep: false }
  );

  @observable
  drawer = observable({
    activeNavPane: NavPanes.PERFORMANCE
  });

  toasterCallback = null;
  errorHandler = null;

  constructor() {
    this.api = new PerformanceWindowApi(this);
    ipcRenderer.on('performance', this.handleDataSync);
  }
  setProfileId(id) {
    this.profileId = id;
    this.api.setProfileId(id);
  }
  @action.bound
  setActiveNavPane = value => {
    this.drawer.activeNavPane = value;
  };
  @action.bound
  handleDataSync = (event, args) => {
    if (args.command === 'mw_setProfileId') {
      this.setProfileId(args.profileId);
      this.api.sendCommandToMainProcess('pw_windowReady');
    } else {
      if (!this.profileId && args.profileId) {
        this.setProfileId(args.profileId);
      }
      if (this.profileId === args.profileId) {
        if (args.command === 'mw_initData') {
          global.config = this.config = restore(args.configObject, {
            deserializer,
            postDeserializer
          });
          this.performancePanel = restore(args.dataObject, {
            deserializer,
            postDeserializer
          });
          attachToMobx(this.performancePanel);
        } else if (args.command === 'mw_updateData' && this.performancePanel !== null) {
          const payload = args.dataObject;
          handleNewData(payload, this.performancePanel);
        } else if (args.command === 'mw_toaster') {
          console.log(args.toasterObj);
          if (this.toasterCallback) {
            this.toasterCallback(args.toasterObj);
          }
        } else if (args.command === 'mw_error') {
          console.log(args);
          if (this.errorHandler) {
            this.errorHandler(args.err);
          }
        } else if (args.command === 'mw_topConnectionsData') {
          console.log(args.profileId);
          console.table(args.payload);
          this.topConnectionsPanel.payload = args.payload;
          this.topConnectionsPanel.highWaterMarkConnection = _.maxBy(
            this.topConnectionsPanel.payload,
            con => {
              return con.us;
            }
          );
        } else if (args.command === 'mw_profilingDatabaseData') {
          // Transform payload into a list of databases.
          const dbList = [];
          const allDbs = [];
          args.payload.forEach(item => {
            // Get name of database (key)
            const db = {};
            const keys = Object.keys(item);
            db.name = keys[0];
            db.value = item[keys[0]];
            if (item[keys[0]].was) {
              dbList.push(db);
            }
            allDbs.push(db);
          });
          this.profilingPanel.databases = allDbs;
          this.profilingPanel.enabledDatabases = dbList;
        } else if (args.command === 'mw_profilingData') {
          // Check if empty result set
          if (
            (Object.keys(args.payload).length === 0 && args.payload.constructor === Object) ||
            args.payload === []
          ) {
            this.profilingPanel.payload = ProfilingConstants.NO_RESULTS;
          } else {
            // Transform array.
            const opsArray = [];
            if (args.payload instanceof Array) {
              // Transform data for ID field.
              args.payload.forEach(opEntry => {
                const keys = Object.keys(opEntry);
                const op = opEntry[keys[0]];
                op.id = keys[0];
                opsArray.push(op);
              });
            } else {
              // Transform data for ID field.
              const keys = Object.keys(args.payload);
              keys.forEach(key => {
                const op = args.payload[key];
                op.id = key;
                opsArray.push(op);
              });
            }
            this.profilingPanel.highWaterMarkProfile = _.maxBy(opsArray, op => {
              return op.millis;
            });
            setTimeout(() => {
              runInAction(() => {
                this.profilingPanel.payload = opsArray;
              });
            }, 0);
          }
        } else if (args.command === 'mw_updateDatabaseConfiguration') {
          console.log('update database configuration res:', args);
          if (this.profilingPanel.databases && args && args.dbConfigs) {
            const newDbs = this.profilingPanel.databases.map(db => {
              const find = args.dbConfigs.find(o => o.name === db.name);
              if (find) {
                db.value = find;
              }
              return db;
            });
            this.api.showToaster({
              message: globalString('performance/profiling/configuration/configure-success'),
              className: 'success',
              iconName: 'pt-icon-thumbs-down'
            });
            this.profilingPanel.databases = newDbs;
          }
        }
      }
    }
  };
}
