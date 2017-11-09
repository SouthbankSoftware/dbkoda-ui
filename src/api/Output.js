/*
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-26T12:18:37+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2017-11-09T14:46:16+11:00
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

import { action, observable, runInAction, extendObservable } from 'mobx';
import { Broker, EventType } from '~/helpers/broker';
import { EditorTypes, ProfileStatus } from '#/common/Constants';
import { NewToaster } from '#/common/Toaster';
import { type ChartPanelStore } from '#/ChartPanel';
import StaticApi from './static';

export default class OutputApi {
  store;
  api;
  outputHash;

  constructor(store, api) {
    this.store = store;
    this.api = api;
    this.outputHash = {};

    this.init = this.init.bind(this);
    this.configureOutputs = this.configureOutputs.bind(this);

    this.debug = false;
  }

  init() {
    this.configureOutputs();
  }

  configureOutputs() {
    this.store.editors.entries().map((editor) => {
      if (editor[1].type == EditorTypes.DRILL) {
        this.addDrillOutput(editor[1]);
      } else {
        this.addOutput(editor[1]);
      }
    });
  }

  @action.bound
  addOutput(editor) {
    this.outputHash[editor.profileId + '|' + editor.shellId] = editor.id;

    try {
      if (this.store.outputs.get(editor.id)) {
        this.store.outputs.get(editor.id).cannotShowMore = true;
        this.store.outputs.get(editor.id).showingMore = false;
        if (editor.id != 'Default' && this.store.outputs.get(editor.id).output) {
          this.store.outputs.get(editor.id).output += globalString('output/editor/restoreSession');
        }
      } else {
        const editorTitle = editor.alias + ' (' + editor.fileName + ')';
        this.store.outputs.set(
          editor.id,
          observable({
            id: editor.id,
            connId: editor.currentProfile,
            shellId: editor.shellId,
            title: editorTitle,
            output: '',
            cannotShowMore: true,
            showingMore: false,
            commandHistory: [],
            enhancedJson: '',
            tableJson: '',
          }),
        );

        if (editor.initialMsg && editor.id != 'Default') {
          let tmp = editor.initialMsg;
          tmp = tmp.replace(/^\n/gm, '');
          tmp = tmp.replace(/^\r/gm, '');
          tmp = tmp.replace(/^\r\n/gm, '');
          this.store.outputs.get(editor.id).output += tmp;
        }
      }
    } catch (err) {
      console.error(err);
    }

    Broker.on(
      EventType.createShellOutputEvent(editor.profileId, editor.shellId),
      this.outputAvailable,
    );
    Broker.on(
      EventType.createShellReconnectEvent(editor.profileId, editor.shellId),
      this.onReconnect,
    );
  }

  @action.bound
  removeOutput(editor) {
    this.store.outputs.delete(editor.id);
    delete this.outputHash[editor.profileId + '|' + editor.shellId];
    Broker.removeListener(
      EventType.createShellOutputEvent(editor.profileId, editor.shellId),
      this.outputAvailable,
    );
    Broker.removeListener(
      EventType.createShellReconnectEvent(editor.profileId, editor.shellId),
      this.onReconnect,
    );
  }

  @action.bound
  swapOutputShellConnection(event) {
    const { oldId, oldShellId, id, shellId } = event;

    const outputId = this.outputHash[oldId + '|' + oldShellId];
    delete this.outputHash[oldId + '|' + oldShellId];
    Broker.removeListener(
      EventType.createShellOutputEvent(oldId, oldShellId),
      this.outputAvailable,
    );
    Broker.removeListener(EventType.createShellReconnectEvent(oldId, oldShellId), this.onReconnect);

    this.outputHash[id + '|' + shellId] = outputId;

    Broker.on(EventType.createShellOutputEvent(id, shellId), this.outputAvailable);
    Broker.on(EventType.createShellReconnectEvent(id, shellId), this.onReconnect);
  }

  @action.bound
  outputAvailable(output) {
    // Parse output for string 'Type "it" for more'
    const outputId = this.outputHash[output.id + '|' + output.shellId];

    const totalOutput = this.store.outputs.get(outputId).output + output.output;
    const profile = this.store.profiles.get(output.id);
    if (profile && profile.status !== ProfileStatus.OPEN) {
      // the connection has been closed.
      return;
    }
    this.store.outputs.get(outputId).output = totalOutput;
    if (
      output &&
      output.output &&
      output.output.replace(/^\s+|\s+$/g, '').includes('Type "it" for more')
    ) {
      if (this.store.outputs.get(outputId)) {
        this.store.outputs.get(outputId).cannotShowMore = false;
      }
    } else if (
      this.store.outputs.get(outputId) &&
      this.store.outputs.get(outputId).cannotShowMore &&
      output &&
      output.output &&
      output.output.replace(/^\s+|\s+$/g, '').endsWith('dbkoda>')
    ) {
      this.store.outputs.get(outputId).cannotShowMore = true;
    }
  }

  @action.bound
  onReconnect(output) {
    const outputId = this.outputHash[output.id + '|' + output.shellId];
    const combineOutput = output.output.join('\r');
    const totalOutput = this.store.outputs.get(outputId).output + combineOutput;
    this.store.outputs.get(outputId).output = totalOutput;
  }

  @action.bound
  addDrillOutput(editor, initialOutput = null) {
    // this.outputHash[editor.profileId + '|' + editor.id] = editor.id;

    try {
      if (this.store.outputs.get(editor.id)) {
        this.store.outputs.get(editor.id).cannotShowMore = true;
        this.store.outputs.get(editor.id).showingMore = false;
        if (editor.id != 'Default' && this.store.outputs.get(editor.id).output) {
          this.store.outputs.get(editor.id).output += globalString('output/editor/restoreSession');
        }
      } else {
        const outputJSON =
          initialOutput != null ? initialOutput : { loading: 'isLoaded' };
        const editorTitle = editor.alias + ' (' + editor.fileName + ')';
        this.store.outputs.set(
          editor.id,
          observable({
            id: editor.id,
            connId: editor.currentProfile,
            title: editorTitle,
            output: JSON.stringify(outputJSON, null, 2),
            cannotShowMore: true,
            showingMore: false,
            commandHistory: [],
            tableJson: {
              json: [outputJSON],
              firstLine: 0,
              lastLine: 0,
            },
          }),
        );

        if (editor.initialMsg && editor.id != 'Default') {
          let tmp = editor.initialMsg;
          tmp = tmp.replace(/^\n/gm, '');
          tmp = tmp.replace(/^\r/gm, '');
          tmp = tmp.replace(/^\r\n/gm, '');
          this.store.outputs.get(editor.id).output += tmp;
        }
      }
    } catch (err) {
      console.error(err);
    }
  }
  @action.bound
  drillOutputAvailable(res) {
    const profile = this.store.profiles.get(res.profileId);
    const strOutput = JSON.stringify(res.output, null, 2);
    const editor = this.store.editors.get(res.id);
    const totalOutput = this.store.outputs.get(res.id).output + editor.doc.lineSep + strOutput;
    if (profile && profile.status !== ProfileStatus.OPEN) {
      // the connection has been closed.
      return;
    }
    this.store.outputs.get(res.id).output = totalOutput;
    this.createJSONTableViewFromJSONArray(res.output, res.id);
  }
  @action.bound
  initJsonView(jsonStr, outputId, displayType, lines, editor, singleDoc) {
    let tabPrefix;
    if (displayType === 'enhancedJson') {
      tabPrefix = 'EnhancedJson-';
    } else if (displayType === 'tableJson') {
      tabPrefix = 'TableView-';
    }

    if (!this.store.outputPanel.currentTab.startsWith(tabPrefix)) {
      this.store.outputPanel.currentTab = tabPrefix + outputId;
    }

    if (displayType === 'tableJson') {
      return this.initJsonTableView(
        jsonStr,
        outputId,
        displayType,
        lines,
        editor.getCodeMirror(),
        singleDoc,
      );
    }

    StaticApi.parseShellJson(jsonStr).then(
      (result) => {
        runInAction(() => {
          if (lines.type === 'SINGLE') {
            this.store.outputs.get(outputId)[displayType] = {
              json: result,
              firstLine: lines.start,
              lastLine: lines.end,
              status: 'SINGLE',
            };
          } else {
            this.store.outputs.get(outputId)[displayType] = {
              json: result,
              firstLine: lines.start,
              lastLine: lines.end,
            };
          }
        });
      },
      (error) => {
        runInAction(
          () => {
            NewToaster.show({
              message: globalString('output/editor/parseJsonError') + error.substring(0, 50),
              className: 'danger',
              icon: '',
            });
          },
          (error) => {
            runInAction(() => {
              NewToaster.show({
                message: globalString('output/editor/parseJsonError') + error.substring(0, 50),
                className: 'danger',
                icon: '',
              });
              this.store.outputPanel.currentTab = this.store.outputPanel.currentTab.split(
                tabPrefix,
              )[1];
            });
          },
        );
      },
    );
  }

  /**
   * Creates and fills a new output with a tabular view of the selected JSON Data.
   *
   * @param {String} jsonStr - The JSON string that triggered the table view.
   * @param {String} outputId - The ID of the output to create a new view for,
   * @param {Object} lines - The lines in codemirror to be searched.
   * @param {Object} cm - The Codemirror instance to collect information from.
   * @param {Boolean} singleLine - Whether or not this is a single line (true) or a result set (false)
   */
  @action.bound
  initJsonTableView(jsonStr, outputId, displayType, lines, cm, singleLine) {
    if (singleLine) {
      // Single line implemention
      StaticApi.parseShellJson(jsonStr).then(
        (result) => {
          runInAction(() => {
            this.store.outputs.get(outputId)[displayType] = {
              json: result,
              firstLine: lines.start,
              lastLine: lines.end,
            };
          });
        },
        (error) => {
          runInAction(
            () => {
              NewToaster.show({
                message: globalString('output/editor/parseJsonError') + error.substring(0, 50),
                className: 'danger',
                icon: '',
              });
            },
            (error) => {
              runInAction(() => {
                NewToaster.show({
                  message: globalString('output/editor/parseJsonError') + error.substring(0, 50),
                  className: 'danger',
                  icon: '',
                });
                this.store.outputPanel.currentTab = this.store.outputPanel.currentTab.split(
                  tabPrefix,
                )[1];
              });
            },
          );
        },
      );
    } else {
      StaticApi.parseTableJson(jsonStr, lines, cm, outputId).then(
        (result) => {
          runInAction(() => {
            this.store.outputs.get(outputId)[displayType] = {
              json: result,
              firstLine: lines.start,
              lastLine: lines.end,
            };
          });
        },
        (error) => {
          runInAction(
            () => {
              NewToaster.show({
                message: globalString('output/editor/parseJsonError') + error.substring(0, 50),
                className: 'danger',
                icon: '',
              });
              this.store.outputs.get(outputId)[displayType] = {
                json: false,
                firstLine: false,
                lastLine: false,
              };
            },
            // FIXME what does this second function mean?
            (error) => {
              runInAction(() => {
                NewToaster.show({
                  message: globalString('output/editor/parseJsonError') + error.substring(0, 50),
                  className: 'danger',
                  icon: '',
                });
                this.store.outputPanel.currentTab = this.store.outputPanel.currentTab.split(
                  tabPrefix,
                )[1];
              });
            },
          );
        },
      );
    }
  }

  /**
   *
   * Simple helper method to create a JSON Table Output given just an array of json objects.
   * @param { Object[] } JSONArray - The array of JSON Documents to render in a table view.
   * @param { String } outputId - The id of the output to create a new table view for.
   */
  @action.bound
  createJSONTableViewFromJSONArray(JSONArray, outputId, targetData) {
    return new Promise((resolve) => {
      runInAction(() => {
        const tabPrefix = 'TableView-';

        if (!this.store.outputPanel.currentTab.startsWith(tabPrefix)) {
          this.store.outputPanel.currentTab = tabPrefix + outputId;
        }
        if (targetData) {
          this.store.outputs.get(outputId).tableJson = {
            json: JSONArray,
            firstLine: 0,
            lastLine: 0,
            collection: targetData.collection,
            database: targetData.database,
          };
        } else {
          this.store.outputs.get(outputId).tableJson = {
            json: JSONArray,
            firstLine: 0,
            lastLine: 0,
            collection: null,
            database: null,
          };
        }
        resolve();
      });
    });
  }

  @action.bound
  showChartPanel(editorId, data, state: ComponentState, error: ?string = null) {
    const { outputs, outputPanel } = this.store;
    const output = outputs.get(editorId);
    const common = {
      data,
      schemaRef: null, // set null to rebuild schema
      chartComponentX: false, // set all three components to false to enable auto selection
      chartComponentY: false,
      chartComponentCenter: false,
      state,
      error,
    };

    if (!output.chartPanel) {
      // first time

      // this object must conform Store type defined at `src/components/ChartPanel/Panel.jsx`
      const chartPanelStore: ChartPanelStore = _.assign(common, {
        dataTreeWidth: 250, // default dataTreeWidth
        chartWidth: 0,
        chartHeight: 0,
        showOtherInCategoricalAxis: true,
        showOtherInCenter: true,
      });

      extendObservable(output, {
        chartPanel: observable.shallowObject(chartPanelStore),
      });
    } else {
      // re-entrant
      _.assign(output.chartPanel, common);
    }

    outputPanel.currentTab = `Chart-${editorId}`;
  }

  _generateSshShellId(sshShellsForProfileId: ObservableMap): number {
    let largestId = -1;

    for (const sshShell of sshShellsForProfileId.values()) {
      const id = Number(sshShell.id);
      if (id > largestId) {
        largestId = id;
      }
    }

    largestId += 1;
    return largestId;
  }

  @action.bound
  addSshShell(profileId: string) {
    const { sshShells, outputPanel } = this.store;
    let sshShellsForProfileId = sshShells.get(profileId);

    if (!sshShellsForProfileId) {
      sshShellsForProfileId = observable.shallowMap();
      sshShells.set(profileId, sshShellsForProfileId);
    }

    const newSshShellId = String(this._generateSshShellId(sshShellsForProfileId));

    sshShellsForProfileId.set(newSshShellId, {
      id: newSshShellId,
    });

    outputPanel.currentTab = `SSH-${profileId}-${newSshShellId}`;
  }

  @action.bound
  removeSshShell(profileId: string, sshShellId: string) {
    const { sshShells } = this.store;
    const sshShellsForId = sshShells.get(profileId);

    if (!sshShellsForId) return;

    sshShellsForId.delete(sshShellId);
  }

  @action.bound
  clearSshShellsForProfile(profileId: string) {
    const { sshShells } = this.store;

    sshShells.delete(profileId);
  }
}
