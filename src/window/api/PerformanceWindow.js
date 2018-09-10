/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-05-15T16:12:25+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-06-05T10:34:36+10:00
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
import { action, extendObservable, runInAction, observable } from 'mobx';
import { NavPanes } from '#/common/Constants';
import { getIdxSuggestionCode } from '#/ExplainPanel/Explain';
import { featherClient } from '../../helpers/feathers';
import { Broker, EventType } from '../../helpers/broker';
import StorageDrilldownApi from '../../api/StorageDrilldown';

export default class PerformanceWindowApi {
  store = null;
  profileId = null;
  lineSeperator = null;
  @observable shellId;
  constructor(store) {
    this.store = store;
    Broker.on(EventType.FEATHER_CLIENT_LOADED, () => {
      this.featherClientLoaded = true;
      this.createNewShell(this.profileId);
    });
  }

  setProfileId(id) {
    this.profileId = id;
  }

  setLineSeperator(lineSep) {
    this.lineSeperator = lineSep;
  }

  getLineSeperator() {
    return this.lineSeperator || (process.platform === 'win32' ? '\r\n' : '\n');
  }

  @action.bound
  showToaster(toasterObj) {
    if (this.store && this.store.toasterCallback) {
      this.store.toasterCallback(toasterObj);
    }
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
      .then(
        action(res => {
          l.info('create new shell ', res);
          this.shellId = res.shellId;
        })
      )
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

  /*
   * Performance Panel API
   */

  @action.bound
  resetHighWaterMark = () => {
    this.sendCommandToMainProcess('pw_resetHighWaterMark');
  };

  @action.bound
  resetPerformancePanel = () => {
    this.sendCommandToMainProcess('pw_resetPerformancePanel');
  };

  /*
   * Profiling Panel API
   */

  @action.bound
  getProfilingDataBases = () => {
    l.info('getProfilingDataBases');
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
    l.info('send profiling database configuration ', configs);
    this.sendCommandToMainProcess('pw_setProfilingDatabseConfiguration', { configs });
  };

  /*
   * Top Connections Panel API
   */

  @action.bound
  getTopConnections = () => {
    this.store.topConnectionsPanel.bLoading = true;
    this.sendCommandToMainProcess('pw_getTopConnections');
  };

  @action.bound
  resetTopConnectionsHWM = () => {
    this.store.topConnectionsPanel.highWaterMark = 0;
    this.getTopConnections();
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
  getExplainForSelectedTopOp = () => {
    const { topConnectionsPanel } = this.store;
    const { selectedOperation } = topConnectionsPanel;
    if (selectedOperation) {
      topConnectionsPanel.bLoadingExplain = true;
      this.getExplainForOperation(selectedOperation)
        .then(operation => {
          l.info(operation);
          runInAction(() => {
            topConnectionsPanel.bLoadingExplain = false;
            topConnectionsPanel.bShowExplain = true;
          });
        })
        .catch(err => {
          l.info(err);
          runInAction(() => {
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
      if (
        selectedOperation.op &&
        (selectedOperation.command || selectedOperation.example) &&
        selectedOperation.ns
      ) {
        const operationCommand = selectedOperation.command || selectedOperation.example;
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
          operationCommand
        ) {
          const cmdForExplain = operationCommand;
          const nsParams = selectedOperation.ns.split('.');
          [database] = nsParams;
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
            l.debug(selectedOperation);
            reject(new Error('dbkoda: Command Not Supported for Explain.'));
          }
        } else if (selectedOperation.op === 'update') {
          const nsParams = selectedOperation.ns.split('.');
          [database] = nsParams;
          const [, collection] = nsParams;
          const commandStr = JSON.stringify(operationCommand);
          explainCmd = `{"update": "${collection}", "updates":[${commandStr}]}`;
        } else if (selectedOperation.op === 'remove') {
          const nsParams = selectedOperation.ns.split('.');
          [database] = nsParams;
          const [, collection] = nsParams;
          const commandStr = JSON.stringify(operationCommand);
          explainCmd = `{"delete": "${collection}", "deletes":[${commandStr}]}`;
        } else {
          l.debug(selectedOperation);
          reject(new Error('dbkoda: Command Not Supported for Explain.'));
        }

        if (explainCmd.length > 0 && database.length > 0) {
          l.info('ExplainCommand: ', explainCmd);
          const service = featherClient().service('/mongo-sync-execution');
          service.timeout = 30000;
          const strCommands =
            'var expRes = db.getSiblingDB("' +
            database +
            '").runCommand({explain: ' +
            explainCmd +
            ', verbosity: "queryPlanner"});\nvar idxRes = dbkInx.suggestIndexesAndRedundants(expRes);\nprintjson({"explain":expRes, "idx":idxRes})';
          service
            .update(this.profileId, {
              shellId: this.shellId,
              commands: strCommands
            })
            .then(
              action(res => {
                l.log(res);
                try {
                  const jsonRes = JSON.parse(res);
                  if (jsonRes) {
                    if (
                      jsonRes.explain &&
                      jsonRes.explain.queryPlanner &&
                      jsonRes.explain.queryPlanner.winningPlan
                    ) {
                      if (selectedOperation.explainPlan) {
                        selectedOperation.explainPlan = jsonRes.explain;
                      } else {
                        extendObservable(selectedOperation, {
                          explainPlan: jsonRes.explain
                        });
                      }
                    }
                    if (jsonRes.idx) {
                      l.info('Index Advisor Result: ', jsonRes.idx);
                      const lineSep = this.getLineSeperator();
                      const suggestionText = getIdxSuggestionCode(
                        jsonRes.idx,
                        selectedOperation.explainPlan,
                        lineSep
                      );
                      l.info('suggestionText:: ', suggestionText);
                      if (selectedOperation.suggestionText) {
                        selectedOperation.suggestionText = suggestionText;
                      } else {
                        extendObservable(selectedOperation, {
                          suggestionText
                        });
                      }
                    }
                  }
                  resolve(selectedOperation);
                } catch (err) {
                  l.error(res);
                  l.info(err);
                  reject(new Error('Unable to get the explain plan for selected operation.'));
                }
              })
            )
            .catch(err => {
              l.error(err);
              reject(
                new Error(
                  'dbkoda: Timeout exceeded while trying to execute explain plan for selected operation.'
                )
              );
            });
        }
      } else {
        reject(new Error('dbkoda: Operation doesnot have required information for explain.'));
      }
    });
  };

  @action.bound
  openEditorWithAdvisorCode = suggestedCode => {
    this.sendCommandToMainProcess('pw_indexAdvisorCode', { suggestedCode });
    this.showToaster({
      message: 'Suggestions code will open a new editor in main window.',
      className: 'success',
      iconName: 'thumbs-up'
    });
    this.sendCommandToMainProcess('pw_focusMainWindow');
  };
  /*
   * Database Storage API
   */

  @action.bound
  openStorageDDView = () => {
    this.store.setActiveNavPane(NavPanes.STORAGE_PANEL);
  };

  storageDrillApi = new StorageDrilldownApi();

  @action.bound
  getStorageData(profileId, shellId) {
    return this.storageDrillApi.getStorageData(profileId, shellId);
  }

  @action.bound
  getChildStorageData(profileId, shellId, db, col) {
    return this.storageDrillApi.getChildStorageData(profileId, shellId, db, col);
  }

  @action.bound
  getExampleForSelectedProfileOp = (selectedOperation: *) => {
    return new Promise((resolve, reject) => {
      if (
        selectedOperation.op &&
        (selectedOperation.command || selectedOperation.example) &&
        selectedOperation.ns
      ) {
        let database = '';
        if (selectedOperation.op === 'command' || selectedOperation.op === 'query') {
          const nsParams = selectedOperation.ns.split('.');
          [database] = nsParams;

          const strCommands = `db.getSiblingDB("${database}").getCollection("system.profile").find({ns:"${
            selectedOperation.ns
          }",op:"${selectedOperation.op}","command.lsid.id":BinData(4,"${
            selectedOperation.example.lsid.id
          }")},{command:1}).limit(1).pretty()`;
          l.log(strCommands);
          const service = featherClient().service('/mongo-sync-execution');
          service.timeout = 30000;

          service
            .update(this.profileId, {
              shellId: this.shellId,
              commands: strCommands,
              responseType: 'STRING'
            })
            .then(
              action(res => {
                resolve(res);
              })
            )
            .catch(err => {
              l.error(err);
              reject(
                new Error(
                  'dbkoda: Timeout exceeded while trying to get example for selected operation.'
                )
              );
            });
        }
      } else {
        reject(new Error('dbkoda: Operation doesnot have required information for example.'));
      }
    });
  };
}
