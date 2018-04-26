/*
 * @flow
 *
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-26T12:18:37+10:00
 * @Email:  wahaj@sout≈hbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-03-22T20:32:10+11:00
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
import { action, observable, runInAction, set } from 'mobx';
import { Broker, EventType } from '~/helpers/broker';
import { EditorTypes, ProfileStatus, OutputToolbarContexts } from '#/common/Constants';
import { NewToaster } from '#/common/Toaster';
import { type ChartPanelStore } from '#/ChartPanel';
import StaticApi from './static';
import { type Profile } from './Profile';
import { type Editor } from './Editor';

export type Output = {
  id: string,
  connId: string,
  shellId: string,
  title: string,
  output: string & [string],
  cannotShowMore: boolean,
  showingMore: boolean,
  commandHistory: [string],
  enhancedJson: string,
  tableJson: string,
  currentExecStartLine: number
};

export type OutputPanel = {
  currentTab: string,
  clearingOutput: boolean,
  executingShowMore: boolean,
  executingTerminalCmd: boolean,
  sendingCommand: string,
  collapseTable: boolean,
  expandTable: boolean
};

export const OutputFileTypes = {
  JSON: 'application/json',
  CSV: 'text/csv'
};

declare type OutputFileType = $Keys<typeof OutputFileTypes>;

/**
 * API class containing functions related to the output and output toolbar as well as managing the global store for these components.
 */
export default class OutputApi {
  store: Store;
  api: {};
  profileStore: { profiles: Map<string, Profile> };
  outputHash: any;
  outputPanel: OutputPanel;

  /**
   *
   * @param {Object} store - The global store object, including the output variables.
   * @param {Object} api -  The API object, for interacting with other API categories.
   * @param {Object} profileStore - The global profiles store, containing information about connection profiles.
   */
  constructor(store: Store, api: {}, profileStore: { profiles: Map<string, Profile> }) {
    this.store = store;
    this.api = api;
    this.profileStore = profileStore;
    this.outputHash = {};
    // $FlowFixMe
    this.outputPanel = this.store.outputPanel;

    // $FlowFixMe
    this.init = this.init.bind(this);
    // $FlowFixMe
    this.configureOutputs = this.configureOutputs.bind(this);
    // $FlowFixMe
    this.debug = false;
  }

  /**
   * Initialize method for setting up the outputs for the first time.
   */
  init() {
    this.configureOutputs();
  }

  /**
   * Iterates through each editor in the store and creates the appropriate outputs.
   */
  configureOutputs() {
    [...this.store.editors.entries()].map(editor => {
      if (editor[1].type == EditorTypes.DRILL) {
        this.addDrillOutput(editor[1]);
      } else {
        this.addOutput(editor[1]);
      }
    });
  }

  /**
   * Adds a new output for an editor.
   * @param {Object} editor - The editor to add a new output tab for.
   */
  @action.bound
  addOutput(editor: Editor) {
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
            tableJson: ''
          })
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
      this.outputAvailable
    );
    Broker.on(
      EventType.createShellReconnectEvent(editor.profileId, editor.shellId),
      this.onReconnect
    );
  }

  /**
   * Removes all outputs for the given editor.
   * @param {Object} editor - The editor to remove all outputs for.
   */
  @action.bound
  removeOutput(editor: Editor) {
    this.store.outputs.delete(editor.id);
    delete this.outputHash[editor.profileId + '|' + editor.shellId];
    Broker.removeListener(
      EventType.createShellOutputEvent(editor.profileId, editor.shellId),
      this.outputAvailable
    );
    Broker.removeListener(
      EventType.createShellReconnectEvent(editor.profileId, editor.shellId),
      this.onReconnect
    );
  }

  /**
   * @TODO
   * @param {*} event
   */
  @action.bound
  swapOutputShellConnection(event: *) {
    const { oldId, oldShellId, id, shellId } = event;

    const outputId = this.outputHash[oldId + '|' + oldShellId];
    delete this.outputHash[oldId + '|' + oldShellId];
    Broker.removeListener(
      EventType.createShellOutputEvent(oldId, oldShellId),
      this.outputAvailable
    );
    Broker.removeListener(EventType.createShellReconnectEvent(oldId, oldShellId), this.onReconnect);

    this.outputHash[id + '|' + shellId] = outputId;

    Broker.on(EventType.createShellOutputEvent(id, shellId), this.outputAvailable);
    Broker.on(EventType.createShellReconnectEvent(id, shellId), this.onReconnect);
  }

  /**
   * This function is triggered by the event broker when new output is recieved from the controller.
   * @param {Object} output - The output tab for which there is new output avaliable.
   */
  @action.bound
  outputAvailable(output: Output) {
    // Parse output for string 'Type "it" for more'
    const outputId = this.outputHash[output.id + '|' + output.shellId];

    const totalOutput = this.store.outputs.get(outputId).output + output.output;
    const profile: Profile = this.profileStore.profiles.get(output.id);
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

  /**
   * @TODO
   * @param {Object} output
   */
  @action.bound
  onReconnect(output: Output) {
    const outputId = this.outputHash[output.id + '|' + output.shellId];
    const combineOutput = output.output.join('\r');
    const totalOutput = this.store.outputs.get(outputId).output + combineOutput;
    this.store.outputs.get(outputId).output = totalOutput;
  }

  /**
   * Creates a new apache drill output for an editor.
   * @param {Object} editor - The editor that requires a new drill output.
   * @param {} initialOutput - The initial output to place in the new Drill tab.
   */
  @action.bound
  addDrillOutput(editor: Editor, initialOutput: ?string = null) {
    // this.outputHash[editor.profileId + '|' + editor.id] = editor.id;

    try {
      if (this.store.outputs.get(editor.id)) {
        this.store.outputs.get(editor.id).cannotShowMore = true;
        this.store.outputs.get(editor.id).showingMore = false;
        if (editor.id != 'Default' && this.store.outputs.get(editor.id).output) {
          this.store.outputs.get(editor.id).output += globalString('output/editor/restoreSession');
        }
      } else {
        const outputJSON = initialOutput != null ? initialOutput : { loading: 'isLoaded' };
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
              lastLine: 0
            }
          })
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

  /**
   * This function will be triggered by the event broker when new apache drill output is recieved from the controller.
   * @param {Object} res - The result object from drill containing the output to render in the tab.
   */
  @action.bound
  // $FlowFixMe drill result object type
  drillOutputAvailable(res) {
    const profile = this.profileStore.profiles.get(res.profileId);
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

  /**
   * Creates a new Enhanced Json View when a user triggers the vent via a right click action.
   * @param {string} jsonStr - The initial json document that was selected by the user.
   * @param {string} outputId - The ID of the output tab the creation was triggered from.
   * @param {string} displayType - Display type identifies which type of view we are creating.
   * @param {Object} lines - An object containing information about what line the event was triggered from.
   * @param {Object} editor - The editor object containing the output to be transformed into a new view,
   * @param {Boolean} singleDoc  - A boolean identifying whether we are generating a single or multi document view.
   */
  @action.bound
  initJsonView(
    jsonStr: string,
    outputId: string,
    displayType: string,
    lines: any,
    editor: Editor,
    singleDoc: boolean,
    tableDefaultView: ?boolean
  ) {
    let tabPrefix = '';
    if (displayType === 'enhancedJson') {
      tabPrefix = 'EnhancedJson-';
    } else if (displayType === 'tableJson') {
      tabPrefix = 'TableView-';
    }

    if (!this.outputPanel.currentTab.startsWith(tabPrefix)) {
      this.outputPanel.currentTab = `${tabPrefix}${outputId}`;
    }

    if (displayType === 'tableJson') {
      return this.initJsonTableView(
        jsonStr,
        outputId,
        displayType,
        lines,
        // $FlowFixMe
        editor.getCodeMirror(),
        singleDoc,
        tableDefaultView
      );
    }

    StaticApi.parseShellJson(jsonStr).then(
      result => {
        runInAction(() => {
          if (lines.type === 'SINGLE') {
            this.store.outputs.get(outputId)[displayType] = {
              json: result,
              firstLine: lines.start,
              lastLine: lines.end,
              status: 'SINGLE'
            };
          } else {
            this.store.outputs.get(outputId)[displayType] = {
              json: result,
              firstLine: lines.start,
              lastLine: lines.end
            };
          }
        });
      },
      error => {
        runInAction(() => {
          NewToaster.show({
            message: globalString('output/editor/parseJsonError') + error.substring(0, 50),
            className: 'danger',
            icon: ''
          });
        });
      }
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
  initJsonTableView(
    jsonStr: string,
    outputId: string,
    displayType: string,
    lines: any,
    cm: {},
    singleLine: boolean,
    defaultOutput: ?boolean
  ) {
    if (defaultOutput) {
      lines.start = this.store.outputs.get(outputId).currentExecStartLine;
      // $FlowFixMe
      lines.end = cm.lineCount();
      StaticApi.parseDefaultTableJson(jsonStr, lines, cm, outputId).then(
        result => {
          console.log(result);
          runInAction(() => {
            this.store.outputs.get(outputId)[displayType] = {
              json: result,
              firstLine: lines.start,
              lastLine: lines.end
            };
          });
        },
        () => {
          runInAction(() => {
            // Revert to raw view if table view JSON can't be parsed
            NewToaster.show({
              message: globalString('output/editor/tableDefaultNotJson'),
              className: 'warning',
              icon: ''
            });
            this.openView(OutputToolbarContexts.RAW);
          });
        }
      );
    } else if (singleLine) {
      // Single line implemention
      StaticApi.parseShellJson(jsonStr).then(
        result => {
          runInAction(() => {
            this.store.outputs.get(outputId)[displayType] = {
              json: result,
              firstLine: lines.start,
              lastLine: lines.end
            };
          });
        },
        error => {
          runInAction(() => {
            NewToaster.show({
              message: globalString('output/editor/parseJsonError') + error.substring(0, 50),
              className: 'danger',
              icon: ''
            });
          });
        }
      );
    } else {
      StaticApi.parseTableJson(jsonStr, lines, cm, outputId).then(
        result => {
          runInAction(() => {
            this.store.outputs.get(outputId)[displayType] = {
              json: result,
              firstLine: lines.start,
              lastLine: lines.end
            };
          });
        },
        error => {
          runInAction(() => {
            NewToaster.show({
              message: globalString('output/editor/parseJsonError') + error.substring(0, 50),
              className: 'danger',
              icon: ''
            });
            this.store.outputs.get(outputId)[displayType] = {
              json: false,
              firstLine: false,
              lastLine: false
            };
          });
        }
      );
    }
  }

  /**
   * Simple helper method to create a JSON Table Output given just an array of json objects.
   * @param { Object[] } JSONArray - The array of JSON Documents to render in a table view.
   * @param { String } outputId - The id of the output to create a new table view for.
   */
  @action.bound
  createJSONTableViewFromJSONArray(
    JSONArray: Array<any>,
    outputId: string,
    targetData: ?{ collection: string, database: string }
  ): Promise<void> {
    return new Promise(resolve => {
      runInAction(() => {
        const tabPrefix = OutputToolbarContexts.TABLE_VIEW;
        if (!this.outputPanel.currentTab.startsWith(tabPrefix)) {
          this.outputPanel.currentTab = tabPrefix + '-' + outputId;
        }
        if (targetData) {
          this.store.outputs.get(outputId).tableJson = {
            json: JSONArray,
            firstLine: 0,
            lastLine: 0,
            collection: targetData.collection,
            database: targetData.database
          };
        } else {
          this.store.outputs.get(outputId).tableJson = {
            json: JSONArray,
            firstLine: 0,
            lastLine: 0,
            collection: null,
            database: null
          };
        }
        resolve();
      });
    });
  }

  /**
   * Function for creating a new Chart Output Panel.
   *
   * @param {String} editorId - The ID of the Editor for which the new chart output should be created.
   * @param {*} data - An Array of JSON Documents to be used for creaeting the charts.
   * @param {*} state
   * @param {*} error
   */
  @action.bound
  showChartPanel(editorId: string, data: Array<any>, state: ComponentState, error: ?string = null) {
    const { outputs } = this.store;
    const output = outputs.get(editorId);
    const common = {
      data,
      schemaRef: null, // set null to rebuild schema
      chartComponentX: false, // set all three components to false to enable auto selection
      chartComponentY: false,
      chartComponentCenter: false,
      state,
      error
    };

    if (!output.chartPanel) {
      // first time

      // this object must conform Store type defined at `src/components/ChartPanel/Panel.jsx`
      const chartPanelStore: ChartPanelStore = _.assign(common, {
        dataTreeWidth: 250, // default dataTreeWidth
        chartWidth: 0,
        chartHeight: 0,
        showOtherInCategoricalAxis: true,
        showOtherInCenter: true
      });

      set(output, {
        // $FlowFixMe
        chartPanel: observable.object(chartPanelStore, null, { deep: false })
      });
    } else {
      // re-entrant
      _.assign(output.chartPanel, common);
    }

    this.outputPanel.currentTab = `${OutputToolbarContexts.CHART_VIEW}-${editorId}`;
  }

  /**
   * A generic function for swapping to an existing Output View from another existing output view.
   * @param {OutputToolbarContext} context - Which context are we swapping to.
   */
  @action.bound
  // $FlowFixMe
  openView(context: OutputToolbarContext) {
    if (IS_DEVELOPMENT) {
      console.log('Opening Output View: ', context);
    }
    // $FlowFixMe
    const { activeEditorId } = this.store.editorPanel;
    if (context == OutputToolbarContexts.RAW) {
      this.outputPanel.currentTab = activeEditorId;
    } else {
      this.outputPanel.currentTab = `${context}-${activeEditorId}`;
    }
  }

  // $FlowFixMe
  getOutputContent(context: OutputToolbarContext, format: ?OutputFileType) {
    const { currentTab } = this.outputPanel;
    if (!format) {
      format = OutputFileTypes.JSON;
    }
    const outputId =
      context === OutputToolbarContexts.RAW ? currentTab : currentTab.replace(`${context}-`, '');
    let output = '';
    switch (context) {
      case OutputToolbarContexts.RAW: {
        ({ output } = this.store.outputs.get(currentTab));
        break;
      }
      case OutputToolbarContexts.TABLE_VIEW: {
        if (format === OutputFileTypes.JSON) {
          output = JSON.stringify(this.store.outputs.get(outputId).tableJson.json);
        } else if (format === OutputFileTypes.CSV) {
          output = StaticApi.convertJsonToCsv(this.store.outputs.get(outputId).tableJson.json);
        }
        break;
      }
      case OutputToolbarContexts.ENHANCED_VIEW: {
        output = JSON.stringify(this.store.outputs.get(outputId).enhancedJson.json);
        break;
      }
      default:
        output = '';
    }
    return output;
  }

  downloadOutput(format: OutputFileType) {
    const { currentTab } = this.outputPanel;
    const outputContext = this.getOutputContext();
    let content;
    switch (outputContext) {
      case OutputToolbarContexts.ENHANCED_VIEW:
        content = this.getOutputContent(outputContext);
        break;
      case OutputToolbarContexts.TABLE_VIEW:
        content = this.getOutputContent(outputContext, format);
        break;
      case OutputToolbarContexts.RAW:
        content = this.getOutputContent(outputContext);
        break;
      default:
        return;
    }
    const data = new Blob([content], { type: format });
    const csvURL = window.URL.createObjectURL(data);
    const tempLink = document.createElement('a');
    const ext = format === OutputFileTypes.CSV ? 'csv' : 'js';
    tempLink.href = csvURL;
    tempLink.setAttribute('download', `output-${currentTab}.${ext}`);
    tempLink.click();
  }

  getOutputContext(): OutputToolbarContext {
    const { currentTab } = this.outputPanel;
    const tabString = currentTab.split('-')[0];
    const validContext = _.findKey(OutputToolbarContexts, ctx => ctx === tabString);
    if (!validContext) {
      return OutputToolbarContexts.RAW;
    }
    return OutputToolbarContexts[validContext];
  }
}
