/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-05-15T16:12:25+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-05-16T13:26:42+10:00
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
import { action, extendObservable, runInAction } from 'mobx';
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
  lineSeperator = null;

  setProfileId(id) {
    this.profileId = id;
  }

  setLineSeperator(lineSep) {
    this.lineSeperator = lineSep;
  }

  getLineSeperator() {
    return this.lineSeperator || '\n';
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
  getExplainForSelectedTopOp = () => {
    const { topConnectionsPanel } = this.store;
    const { selectedOperation } = topConnectionsPanel;
    if (selectedOperation) {
      topConnectionsPanel.bLoadingExplain = true;
      this.getExplainForOperation(selectedOperation)
        .then(operation => {
          console.log(operation);
          runInAction(() => {
            topConnectionsPanel.bLoadingExplain = false;
            topConnectionsPanel.bShowExplain = true;
          });
        })
        .catch(err => {
          console.log(err);
          runInAction(() => {
            topConnectionsPanel.lastExplainId = null;
            topConnectionsPanel.bLoadingExplain = false;
          });
          this.showToaster({
            message: err.message,
            className: 'danger',
            iconName: 'pt-icon-thumbs-down'
          });
        });
    }
  };

  getExplainForOperation = (selectedOperation: *) => {
    return new Promise((resolve, reject) => {
      if (selectedOperation.op && selectedOperation.command && selectedOperation.ns) {
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

        let explainCmd = '';
        let database = '';

        if (
          (selectedOperation.op === 'command' || selectedOperation.op === 'query') &&
          selectedOperation.command &&
          selectedOperation.command.$db
        ) {
          const cmdForExplain = selectedOperation.command;
          const databaseObj = _.pick(cmdForExplain, '$db');
          database = databaseObj.$db;
          let commandParams = _.omit(cmdForExplain, '$db');
          const command = _.pickBy(commandParams, filterCommand);
          if (Object.keys(command).length > 0) {
            const commandStr = JSON.stringify(command);
            commandParams = _.omitBy(commandParams, filterCommand);
            const commandParamsStr = JSON.stringify(commandParams);
            explainCmd =
              commandParamsStr.substr(0, 1) +
              commandStr.substr(1, commandStr.length - 2) +
              ',' +
              commandParamsStr.substr(1);
          } else {
            reject(new Error('dbkoda: Command Not Supported for Explain.'));
          }
        } else if (selectedOperation.op === 'update') {
          const nsParams = selectedOperation.ns.split('.');
          [database] = nsParams;
          const [, collection] = nsParams;
          const commandStr = JSON.stringify(selectedOperation.command);
          explainCmd = `{"update": "${collection}", "updates":[${commandStr}]}`;
        } else if (selectedOperation.op === 'remove') {
          const nsParams = selectedOperation.ns.split('.');
          [database] = nsParams;
          const [, collection] = nsParams;
          const commandStr = JSON.stringify(selectedOperation.command);
          explainCmd = `{"delete": "${collection}", "deletes":[${commandStr}]}`;
        } else {
          reject(new Error('dbkoda: Command Not Supported for Explain.'));
        }

        if (explainCmd.length > 0 && database.length > 0) {
          console.log('ExplainCommand: ', explainCmd);
          const driverService = featherClient().service('drivercommands');
          driverService.timeout = 30000;
          return driverService
            .patch(this.profileId, {
              database,
              command: {
                explain: JSON.parse(explainCmd),
                verbosity: 'queryPlanner'
              }
            })
            .then(res => {
              console.log(res);
              if (res && res.queryPlanner && res.queryPlanner.winningPlan) {
                if (selectedOperation.explainPlan) {
                  selectedOperation.explainPlan = res;
                } else {
                  extendObservable(selectedOperation, {
                    explainPlan: res
                  });
                }
              }
              resolve(selectedOperation);
            })
            .catch(err => {
              console.log(err);
              reject(
                new Error('Timeout exceeded while trying to execute explain for selected command.')
              );
            });
        }
      } else {
        reject(new Error('dbkoda: Operation doesnot have required information for explain.'));
      }
    });
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
