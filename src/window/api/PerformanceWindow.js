/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-05-15T16:12:25+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-05-15T16:59:39+10:00
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
import { action } from 'mobx';
import { NavPanes } from '#/common/Constants';
import { featherClient } from '../../helpers/feathers';
import { Broker, EventType } from '../../helpers/broker';
import StorageDrilldownApi from '../../api/StorageDrilldown';

export default class PerformanceWindowApi {
  store = null;
  constructor(store) {
    this.store = store;
    Broker.on(EventType.FEATHER_CLIENT_LOADED, () => {
      this.featherClientLoaded = true;
      this.createNewShell(this.profileId);
    });
  }
  profileId = null;
  setProfileId(id) {
    this.profileId = id;
  }

  @action.bound
  createNewShell(profileId) {
    const { shellService } = featherClient();
    if (!shellService || !profileId) {
      return;
    }
    shellService.timeout = 30000;
    shellService
      .create({ id: profileId })
      .then(res => {
        console.log('create new shell ', res);
        this.shellId = res.shellId;
      })
      .catch(err => {
        l.error(err);
      });
  }

  @action.bound
  closeShell() {
    const { shellService } = featherClient();
    if (!shellService || !this.profileId) {
      return;
    }
    shellService
      .remove({ id: this.profileId, query: { shellId: this.shellId } })
      .then(e => l.info('close shell ', e))
      .catch(err => l.error(err));
  }

  @action.bound
  sendCommandToMainProcess = (command, params) => {
    if (IS_ELECTRON) {
      const { ipcRenderer } = window.require('electron');

      ipcRenderer.send('performance', {
        command,
        profileId: this.profileId,
        ...params
      });
    }
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
    // this.sendCommandToMainProcess('pw_openStorageDDView');
    this.store.setActiveNavPane(NavPanes.STORAGE_PANEL);
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
  getExplainForSelectedOp = () => {
    const { topConnectionsPanel } = this.store;
    const { selectedConnection, selectedOperation } = topConnectionsPanel;
    if (selectedConnection && selectedOperation) {
      const explainId = selectedConnection.connectionId + '_' + selectedOperation.opId;
      topConnectionsPanel.lastExplainId = explainId;
      topConnectionsPanel.bLoadingExplain = true;

      const filterCommand = (value, key) => {
        const loKey = key.toLowerCase();
        if (
          loKey === 'findandmodify' ||
          loKey === 'find' ||
          loKey === 'distinct' ||
          loKey === 'count'
        ) {
          return true;
        }
        return false;
      };
      const cmdNotSupported = () => {
        topConnectionsPanel.lastExplainId = null;
        topConnectionsPanel.bLoadingExplain = false;
        this.showToaster({
          message: 'Command not supported for Explain.',
          className: 'danger',
          iconName: 'pt-icon-thumbs-down'
        });
      };

      let explainCommandStr = '';
      let databaseStr = '';

      if (
        (selectedOperation.op === 'command' || selectedOperation.op === 'query') &&
        selectedOperation.command &&
        selectedOperation.command.$db
      ) {
        const cmdForExplain = selectedOperation.command;
        const database = _.pick(cmdForExplain, '$db');
        databaseStr = database.$db;
        let commandParams = _.omit(cmdForExplain, '$db');
        const command = _.pickBy(commandParams, filterCommand);
        if (Object.keys(command).length > 0) {
          const commandStr = JSON.stringify(command);
          commandParams = _.omitBy(commandParams, filterCommand);
          const commandParamsStr = JSON.stringify(commandParams);
          explainCommandStr =
            commandParamsStr.substr(0, 1) +
            commandStr.substr(1, commandStr.length - 2) +
            ',' +
            commandParamsStr.substr(1);
        } else {
          cmdNotSupported();
        }
      } else if (selectedOperation.op === 'update') {
        const nsParams = selectedOperation.ns.split('.');
        [databaseStr] = nsParams;
        const [, collection] = nsParams;
        const commandStr = JSON.stringify(selectedOperation.command);
        explainCommandStr = `{"update": "${collection}", "updates":[${commandStr}]}`;
      } else if (selectedOperation.op === 'remove') {
        const nsParams = selectedOperation.ns.split('.');
        [databaseStr] = nsParams;
        const [, collection] = nsParams;
        const commandStr = JSON.stringify(selectedOperation.command);
        explainCommandStr = `{"delete": "${collection}", "deletes":[${commandStr}]}`;
      } else {
        cmdNotSupported();
      }

      if (explainCommandStr.length > 0 && databaseStr.length > 0) {
        console.log('ExplainCommand: ', explainCommandStr);
        this.sendCommandToMainProcess('pw_getOperationExplainPlan', {
          explainId,
          explainCmd: explainCommandStr,
          database: databaseStr
        });
      }
    }
  };

  @action.bound
  getIndexAdvisorForSelectedOp = () => {
    const { topConnectionsPanel } = this.store;
    const { selectedConnection, selectedOperation } = topConnectionsPanel;
    if (selectedConnection && selectedOperation) {
      if (selectedOperation.explainPlan) {
        const queryPlaner = _.pick(selectedOperation.explainPlan, ['queryPlanner']);
        const service = featherClient().service('/mongo-sync-execution');
        const explainOutput = "JSON.parse('" + JSON.stringify(queryPlaner) + "')";
        console.log('Explain Output for Idx Advisor: ', explainOutput);
        service.timeout = 30000;
        service
          .update(this.profileId, {
            shellId: this.shellId,
            commands: 'dbkInx.suggestIndexesAndRedundants(' + explainOutput + ');'
          })
          .then(res => {
            console.log('Index Advisor Result: ', JSON.parse(res));
          })
          .catch(err => {
            console.error(err);
          });
      }
    }
  };

  @action.bound
  setProfilingDatabaseConfiguration = configs => {
    console.log('send profiling database configuration ', configs);
    this.sendCommandToMainProcess('pw_setProfilingDatabseConfiguration', { configs });
  };

  @action.bound
  showToaster(toasterObj) {
    if (this.store && this.store.toasterCallback) {
      this.store.toasterCallback(toasterObj);
    }
  }

  storageDrillApi = new StorageDrilldownApi();

  @action.bound
  getStorageData(profileId, shellId) {
    return this.storageDrillApi.getStorageData(profileId, shellId);
  }

  @action.bound
  getChildStorageData(profileId, shellId, db, col) {
    return this.storageDrillApi.getChildStorageData(profileId, shellId, db, col);
  }
}
