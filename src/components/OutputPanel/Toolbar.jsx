/*
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

/**
 * @Author: Chris Trott <chris>
 * @Date:   2017-03-10T12:33:56+11:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   Michael
 * @Last modified time: 2018-01-23T15:33:23+10:00
 */

import React from 'react';
import Mousetrap from 'mousetrap';
import 'mousetrap-global-bind';
import { inject, observer } from 'mobx-react';
import { action, runInAction, reaction } from 'mobx';
import {
  Intent,
  Tooltip,
  AnchorButton,
  Position,
  EditableText,
  Menu,
  MenuItem,
  Popover
} from '@blueprintjs/core';
import { featherClient } from '~/helpers/feathers';
import { Broker, EventType } from '~/helpers/broker';
import { OutputHotkeys } from '#/common/hotkeys/hotkeyList.jsx';
import { NewToaster } from '#/common/Toaster';
import StaticApi from '~/api/static';
import { OutputFileTypes } from '~/api/Output';
import { OutputToolbarContexts } from '../common/Constants';
import ClearOutputIcon from '../../styles/icons/clear-output-icon.svg';
import ShowMoreIcon from '../../styles/icons/show-more-icon.svg';
import SaveOutputIcon from '../../styles/icons/save-output-icon.svg';
import ExpandIcon from '../../styles/icons/code-folder-icon.svg';
import CollapseIcon from '../../styles/icons/code-folder-right-icon.svg';
import RefreshIcon from '../../styles/icons/refresh-icon.svg';
import ChartIcon from '../../styles/icons/chart-icon.svg';
import TableIcon from '../../styles/icons/table-icon.svg';
import EnhanceJSONIcon from '../../styles/icons/enhanced-json-icon.svg';

/**
 * The OutputPanel toolbar, which hold the commands and actions specific to the output panel
 *  @param {Object} props - Holds the properties store (injected) and id (passed)
 */
@inject(allStores => ({
  store: allStores.store,
  api: allStores.api,
  config: allStores.config
}))
@observer
export default class Toolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      context: OutputToolbarContexts.DEFAULT,
      tableToolbar: {
        limit: 200
      }
    };
    this.downloadOutput = this.downloadOutput.bind(this);

    // Determine toolbar context.
    if (
      this.props.store.outputPanel.currentTab.startsWith(
        OutputToolbarContexts.TABLE_VIEW
      )
    ) {
      this.state.context = OutputToolbarContexts.TABLE_VIEW;
    } else {
      this.state.context = OutputToolbarContexts.DEFAULT;
    }

    /**
     * Reaction to fire off execution of ShowMore (it) command
     */
    reaction(
      () => this.props.store.outputPanel.executingShowMore,
      executingShowMore => {
        if (
          executingShowMore &&
          this.props.store.outputs.get(
            this.props.store.outputPanel.currentTab
          ) &&
          !this.props.store.outputs.get(this.props.store.outputPanel.currentTab)
            .cannotShowMore
        ) {
          const command = 'it';
          this.props.store.editorToolbar.isActiveExecuting = true;
          this.props.store.editors.get(
            this.props.store.outputPanel.currentTab
          ).executing = true;
          const service = featherClient().service('/mongo-shells');
          service.timeout = 30000;
          service.update(
            this.props.store.outputs.get(
              this.props.store.outputPanel.currentTab
            ).connId,
            {
              shellId: this.props.store.outputs.get(
                this.props.store.outputPanel.currentTab
              ).shellId,
              commands: command
            }
          );
          this.props.store.outputs.get(
            this.props.store.outputPanel.currentTab
          ).cannotShowMore = true;
        }
        this.props.store.outputPanel.executingShowMore = false;
      },
      { name: 'reactionOutputToolbarShowMore' }
    );

    /**
     * Reaction to clear the output console
     */
    reaction(
      () => this.props.store.outputPanel.clearingOutput,
      clearingOutput => {
        const { currentTab } = this.props.store.outputPanel;
        if (clearingOutput && this.props.store.outputs.get(currentTab)) {
          this.props.store.outputs.get(currentTab).output = '';
          this.props.store.outputs.get(currentTab).currentExecStartLine = 0;
          this.props.store.outputPanel.clearingOutput = false;
        } else if (currentTab.indexOf('Explain-') === 0) {
          // close explain output
          const editorKey = currentTab.split('Explain-')[1];
          const editor = this.props.store.editors.get(editorKey);
          if (editor) {
            this.props.store.editors.set(editorKey, {
              ...editor,
              explains: undefined
            });
            this.props.store.outputPanel.currentTab = editorKey;
          }
          this.props.store.outputPanel.clearingOutput = false;
        } else if (currentTab.indexOf('Details-') === 0) {
          this.props.store.editors.get(
            this.props.store.editorPanel.activeEditorId
          ).detailsView = undefined;
          const editorKey = currentTab.split('Details-')[1];
          this.props.store.outputPanel.currentTab = editorKey;
          this.props.store.outputPanel.clearingOutput = false;
        } else if (currentTab.indexOf('EnhancedJson-') === 0) {
          const editorKey = currentTab.split('EnhancedJson-')[1];
          this.props.store.outputs.get(editorKey).enhancedJson = '';
          this.props.store.outputPanel.clearingOutput = false;
          this.props.store.outputPanel.currentTab = editorKey;
        } else if (currentTab.indexOf('TableView-') === 0) {
          const editorKey = currentTab.split('TableView-')[1];
          this.props.store.outputs.get(editorKey).tableJson = '';
          this.props.store.outputPanel.clearingOutput = false;
          this.props.store.outputPanel.currentTab = editorKey;
        } else if (currentTab.startsWith('ChartView-')) {
          const editorKey = currentTab.split('ChartView-')[1];
          this.props.store.outputs.get(editorKey).chartPanel = null;
          this.props.store.outputPanel.clearingOutput = false;
          this.props.store.outputPanel.currentTab = editorKey;
        } else if (currentTab.startsWith('Storage-')) {
          this.props.store.profileList.selectedProfile.storageView.visible = false;
          this.props.store.outputPanel.clearingOutput = false;
          this.props.store.outputPanel.currentTab = this.props.store.editorPanel.activeEditorId;
        }
      },
      { name: 'reactionOutputToolbarClearOutput' }
    );

    reaction(
      () => this.props.store.editorToolbar.shellId,
      () => { this.onShellIdChanged(); }
    );
  }

  /**
   * When component mounts the hotkeys will be bound.
   */
  componentDidMount() {
    // Add hotkey bindings for this component:
    Mousetrap.bindGlobal(OutputHotkeys.clearOutput.keys, this.clearOutput);
    Mousetrap.bindGlobal(OutputHotkeys.showMore.keys, this.showMore);
  }

  /**
   * When component unmounts the hotkeys will be unbound.
   */
  componentWillUnmount() {
    Mousetrap.unbindGlobal(OutputHotkeys.clearOutput.keys, this.clearOutput);
    Mousetrap.unbindGlobal(OutputHotkeys.showMore.keys, this.showMore);
    Broker.removeListener(
      EventType.createShellExecutionFinishEvent(
        this.props.store.editorToolbar.currentProfile,
        this.props.store.editorToolbar.shellId
      ),
      this.onExecutionFinished.bind(this)
    );
  }

  /**
   * Clears the output editor panel of all it's contents
   */
  @action.bound
  clearOutput() {
    this.props.store.outputPanel.clearingOutput = true;
  }

  /**
   * Sends the 'it' command back to the shell on the controller to get more results
   */
  @action.bound
  showMore() {
    this.props.store.outputPanel.executingShowMore = true;
  }

  /**
   * Downloads the current contents of the Output Editor to a file
   */
  downloadOutput(format = OutputFileTypes.JSON) {
    this.props.api.outputApi.downloadOutput(format);
  }

  onShellIdChanged() {
    console.log(`EventType.createShellExecutionFinishEvent(${this.props.store.editorPanel.activeEditorId}, ${this.props.store.editorToolbar.shellId})`);
    Broker.on(
      EventType.createShellExecutionFinishEvent(
        this.props.store.editorToolbar.currentProfile,
        this.props.store.editorToolbar.shellId
      ),
      () => { this.onExecutionFinished(this.props.store.editorToolbar.currentProfile, this.props.store.editorToolbar.shellId); }
    );
  }

  @action.bound
  onExecutionFinished(currentProfile, execShellId) {
    console.log('Execution Finished!');
    const {shellId} = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
    if (this.props.config.settings.tableOutputDefault && shellId === execShellId) {
      setTimeout(() => {
        this.openTableView(false, true);
      }, 0);
    }
  }


  renderDownloadMenu() {
    return (
      <Menu>
        <MenuItem
          onClick={() => {
            this.downloadOutput(OutputFileTypes.JSON);
          }}
          text={globalString('output/toolbar/downloadMenu/json')}
        />
        <MenuItem
          onClick={() => {
            this.downloadOutput(OutputFileTypes.CSV);
          }}
          text={globalString('output/toolbar/downloadMenu/csv')}
        />
      </Menu>
    );
  }

  /**
   * Render function for the raw toolbar.
   */
  renderDefaultToolbar(disabledButtons) {
    // Get list of existing outputs for enabling buttons:
    let existingOutputs;
    const currentOutput = {};
    if (true) {
      existingOutputs = this.getExistingOutputs();
      if (this.props.store.outputPanel.currentTab.startsWith('TableView-')) {
        currentOutput.tableView = true;
      } else if (
        this.props.store.outputPanel.currentTab.startsWith('Enhanced')
      ) {
        currentOutput.enhancedView = true;
      } else if (this.props.store.outputPanel.currentTab.startsWith('Chart')) {
        currentOutput.chartView = true;
      } else if (
        this.props.store.outputs.get(this.props.store.outputPanel.currentTab)
      ) {
        currentOutput.rawView = true;
      }
    }

    return (
      <nav className="pt-navbar pt-dark .modifier outputToolbar">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-navbar-heading">
            {globalString('output/headings/default')}
          </div>
          {true && (
            <div>
              <Tooltip
                intent={Intent.PRIMARY}
                hoverOpenDelay={1000}
                inline
                content={globalString('output/toolbar/raw')}
                tooltipClassName="pt-dark"
                position={Position.BOTTOM}
              >
                <AnchorButton
                  disabled={disabledButtons.raw || currentOutput.rawView}
                  className="pt-intent-danger circleButton jsonTreeViewButton"
                  onClick={() => {
                    this.props.api.outputApi.openView(
                      OutputToolbarContexts.RAW
                    );
                  }}
                >
                  <EnhanceJSONIcon
                    className="dbKodaSVG"
                    width={30}
                    height={30}
                  />
                </AnchorButton>
              </Tooltip>
              <Tooltip
                intent={Intent.PRIMARY}
                hoverOpenDelay={1000}
                inline
                content={globalString('output/toolbar/jsonTree')}
                tooltipClassName="pt-dark"
                position={Position.BOTTOM}
              >
                <AnchorButton
                  className="pt-intent-danger circleButton jsonTreeViewButton"
                  onClick={() => {
                    if (
                      existingOutputs.enhancedJson &&
                      !currentOutput.rawView
                    ) {
                      this.props.api.outputApi.openView(
                        OutputToolbarContexts.ENHANCED_VIEW
                      );
                    } else {
                      this.openJsonTreeView();
                    }
                  }}
                  disabled={
                    (disabledButtons.jsonView &&
                      !existingOutputs.enhancedJson) ||
                    currentOutput.enhancedView
                  }
                >
                  <EnhanceJSONIcon
                    className="dbKodaSVG"
                    width={30}
                    height={30}
                  />
                </AnchorButton>
              </Tooltip>
              <Tooltip
                intent={Intent.PRIMARY}
                hoverOpenDelay={1000}
                inline
                content={globalString('output/toolbar/table')}
                tooltipClassName="pt-dark"
                position={Position.BOTTOM}
              >
                <AnchorButton
                  className="pt-intent-danger circleButton tableViewButton"
                  onClick={() => {
                    if (currentOutput.chartView) {
                      this.openTableView(true, false);
                    } else if (
                      existingOutputs.tableJson &&
                      !currentOutput.rawView
                    ) {
                      this.props.api.outputApi.openView(
                        OutputToolbarContexts.TABLE_VIEW
                      );
                    } else {
                      this.openTableView(false, false);
                    }
                  }}
                  disabled={
                    (disabledButtons.tableView && !existingOutputs.tableJson) ||
                    currentOutput.tableView
                  }
                >
                  <TableIcon className="dbKodaSVG" width={30} height={30} />
                </AnchorButton>
              </Tooltip>
              <Tooltip
                intent={Intent.PRIMARY}
                hoverOpenDelay={1000}
                inline
                content={globalString('output/toolbar/chart')}
                tooltipClassName="pt-dark"
                position={Position.BOTTOM}
              >
                <AnchorButton
                  className="pt-intent-danger circleButton chartViewButton"
                  onClick={() => {
                    if (existingOutputs.chartPanel && !currentOutput.rawView) {
                      this.props.api.outputApi.openView(
                        OutputToolbarContexts.CHART_VIEW
                      );
                    } else {
                      this.openChartView();
                    }
                  }}
                  disabled={
                    (disabledButtons.chartView &&
                      !existingOutputs.chartPanel) ||
                    currentOutput.chartView
                  }
                >
                  <ChartIcon className="dbKodaSVG" width={30} height={30} />
                </AnchorButton>
              </Tooltip>
            </div>
          )}
        </div>
        <div className="pt-navbar-group pt-align-right">
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            inline
            content={globalString('output/toolbar/clear')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}
          >
            <AnchorButton
              className="pt-intent-danger circleButton clearOutputBtn"
              onClick={this.clearOutput}
            >
              <ClearOutputIcon className="dbKodaSVG" width={30} height={30} />
            </AnchorButton>
          </Tooltip>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            inline
            content={globalString('output/toolbar/showMore')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}
          >
            <AnchorButton
              className="showMoreBtn circleButton"
              onClick={this.showMore}
              disabled={
                this.props.store.outputPanel.currentTab == 'Default' ||
                this.props.store.outputPanel.currentTab.indexOf('Explain') >=
                  0 ||
                this.props.store.outputPanel.currentTab.indexOf('Details') >=
                  0 ||
                (this.props.store.outputs.get(
                  this.props.store.outputPanel.currentTab
                ) &&
                  this.props.store.outputs.get(
                    this.props.store.outputPanel.currentTab
                  ).cannotShowMore)
              }
            >
              <ShowMoreIcon className="dbKodaSVG" width={30} height={30} />
            </AnchorButton>
          </Tooltip>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            inline
            content={globalString('output/toolbar/save')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}
          >
            <AnchorButton
              className="saveOutputBtn circleButton"
              onClick={this.downloadOutput}
            >
              <SaveOutputIcon className="dbKodaSVG" width={30} height={30} />
            </AnchorButton>
          </Tooltip>
        </div>
      </nav>
    );
  }

  /**
   * Render function for a Table View Toolbar.
   */
  renderTableToolbar() {
    const editor = this.props.store.editors.get(
      this.props.store.editorPanel.activeEditorId
    );

    // Get list of already generated tabs for switching too:
    const existingOutputs = this.getExistingOutputs();

    return (
      <nav className="pt-navbar pt-dark .modifier outputToolbar">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-navbar-heading">
            {globalString('output/headings/table')}
          </div>
          {IS_DEVELOPMENT && (
            <div>
              <Tooltip
                intent={Intent.PRIMARY}
                hoverOpenDelay={1000}
                inline
                content={globalString('output/toolbar/raw')}
                tooltipClassName="pt-dark"
                position={Position.BOTTOM}
              >
                <AnchorButton
                  className="pt-intent-danger circleButton rawButton"
                  onClick={() => {
                    this.props.api.outputApi.openView(
                      OutputToolbarContexts.RAW
                    );
                  }}
                >
                  <EnhanceJSONIcon
                    className="dbKodaSVG"
                    width={30}
                    height={30}
                  />
                </AnchorButton>
              </Tooltip>
              <Tooltip
                intent={Intent.PRIMARY}
                hoverOpenDelay={1000}
                inline
                content={globalString('output/toolbar/jsonTree')}
                tooltipClassName="pt-dark"
                position={Position.BOTTOM}
              >
                <AnchorButton
                  className="pt-intent-danger circleButton jsonTreeViewButton"
                  onClick={() => {
                    this.props.api.outputApi.openView(
                      OutputToolbarContexts.ENHANCED_VIEW
                    );
                  }}
                  disabled={!existingOutputs.enhancedJson}
                >
                  <EnhanceJSONIcon
                    className="dbKodaSVG"
                    width={30}
                    height={30}
                  />
                </AnchorButton>
              </Tooltip>
              <Tooltip
                intent={Intent.PRIMARY}
                hoverOpenDelay={1000}
                inline
                content={globalString('output/toolbar/table')}
                tooltipClassName="pt-dark"
                position={Position.BOTTOM}
              >
                <AnchorButton
                  className="pt-intent-danger circleButton tableViewButton"
                  disabled
                >
                  <TableIcon className="dbKodaSVG" width={30} height={30} />
                </AnchorButton>
              </Tooltip>
              <Tooltip
                intent={Intent.PRIMARY}
                hoverOpenDelay={1000}
                inline
                content={globalString('output/toolbar/chart')}
                tooltipClassName="pt-dark"
                position={Position.BOTTOM}
              >
                <AnchorButton
                  className="pt-intent-danger circleButton chartViewButton"
                  onClick={() => {
                    this.openChartView(true);
                  }}
                >
                  <ChartIcon className="dbKodaSVG" width={30} height={30} />
                </AnchorButton>
              </Tooltip>
            </div>
          )}
        </div>
        <div className="pt-navbar-group pt-align-right">
          {this.props.store.outputs.get(editor.id).tableJson &&
            this.props.store.outputs.get(editor.id).tableJson.database && (
              <div>
                <span className="docLimitLabel">Document Limit: </span>
                <EditableText
                  minLines={1}
                  maxLines={1}
                  maxLength={9}
                  placeholder="200"
                  value={this.state.tableToolbar.limit}
                  onChange={string => {
                    string = parseInt(string, 10);
                    if (!string) {
                      string = '';
                    }
                    this.setState({ tableToolbar: { limit: string } });
                  }}
                  intent={Intent.NONE}
                  className="limit"
                />
              </div>
            )}
          {this.props.store.outputs.get(editor.id).tableJson &&
            this.props.store.outputs.get(editor.id).tableJson.database && (
              <div>
                <Tooltip
                  intent={Intent.PRIMARY}
                  hoverOpenDelay={1000}
                  inline
                  content={globalString('output/toolbar/tableToolbar/refresh')}
                  tooltipClassName="pt-dark"
                  position={Position.BOTTOM}
                >
                  <AnchorButton
                    className="refreshButton circleButton"
                    onClick={() => {
                      if (!this.state.tableToolbar.limit) {
                        this.state.tableToolbar.limit = 200;
                      }
                      this.props.api.treeApi.openNewTableViewForCollection(
                        {
                          collection: this.props.store.outputs.get(editor.id)
                            .tableJson.collection,
                          database: this.props.store.outputs.get(editor.id)
                            .tableJson.database
                        },
                        this.state.tableToolbar.limit
                      );
                    }}
                  >
                    <RefreshIcon className="dbKodaSVG" width={30} height={30} />
                  </AnchorButton>
                </Tooltip>
              </div>
            )}
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            inline
            content={globalString('output/toolbar/tableToolbar/expandAll')}
            tooltipClassName="pt-dark"
            className="expandWrapper"
            position={Position.BOTTOM}
          >
            <AnchorButton
              className="expandAllButton circleButton"
              onClick={() => {
                runInAction(() => {
                  this.props.store.outputPanel.expandTable = false;
                  this.props.store.outputPanel.expandTable = true;
                });
              }}
            >
              <ExpandIcon className="dbKodaSVG" width={30} height={30} />
            </AnchorButton>
          </Tooltip>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            inline
            content={globalString('output/toolbar/tableToolbar/collapseAll')}
            tooltipClassName="pt-dark"
            className="collapseWrapper"
            position={Position.BOTTOM}
          >
            <AnchorButton
              className="collapseAllButton circleButton"
              onClick={() => {
                runInAction(() => {
                  this.props.store.outputPanel.collapseTable = false;
                  this.props.store.outputPanel.collapseTable = true;
                });
              }}
            >
              <CollapseIcon className="dbKodaSVG" width={30} height={30} />
            </AnchorButton>
          </Tooltip>
          <Popover
            content={this.renderDownloadMenu()}
            position={Position.BOTTOM_LEFT}
          >
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              inline
              content={globalString('output/toolbar/save')}
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}
            >
              <AnchorButton
                className="saveOutputBtn circleButton"
                onClick={this.showDownloadMenu}
              >
                <SaveOutputIcon className="dbKodaSVG" width={30} height={30} />
              </AnchorButton>
            </Tooltip>
          </Popover>
        </div>
      </nav>
    );
  }

  /**
   * Retrieves an object detailing which outputs are already existing.
   */
  @action.bound
  getExistingOutputs() {
    // Can always swap to Raw Output.
    const existingOutputs = { raw: true };
    if (
      this.props.store.outputs.get(this.props.store.editorPanel.activeEditorId)
    ) {
      if (
        this.props.store.outputs.get(
          this.props.store.editorPanel.activeEditorId
        ).chartPanel
      ) {
        existingOutputs.chartPanel = true;
      }
      if (
        this.props.store.outputs.get(
          this.props.store.editorPanel.activeEditorId
        ).enhancedJson
      ) {
        existingOutputs.enhancedJson = true;
      }
      if (
        this.props.store.outputs.get(
          this.props.store.editorPanel.activeEditorId
        ).tableJson
      ) {
        existingOutputs.tableJson = true;
      }
    }
    return existingOutputs;
  }

  /**
   * Find the last line in the Codemirror instance to contain a valid JSON object.
   * @param {Object} codeMirror - The CodeMirror instance to fetch the last line of.
   * @return {integer} - Returns the line number of the last valid line.
   */
  @action.bound
  getLastLine(codeMirror) {
    let linesSearched = 2;
    let lastLine = codeMirror.getLine(codeMirror.lineCount() - linesSearched);
    while (
      lastLine &&
      !lastLine.match(/{|}/gim) &&
      linesSearched < 50 &&
      linesSearched < codeMirror.lineCount()
    ) {
      linesSearched += 1;
      lastLine = codeMirror.getLine(codeMirror.lineCount() - linesSearched);
    }
    if (linesSearched == codeMirror.lineCount() || !lastLine) {
      return false;
    }
    return codeMirror.lineCount() - linesSearched;
  }

  /**
   * Creates a new table view from the current view.
   * @param {boolean} fromChart - Determines whether or not the table should be generated from the chart view.
   */
  @action.bound
  openTableView(fromChart, defaultView) {
    let editor;
    if (fromChart) {
      editor = this.props.editorRefs[this.props.store.outputPanel.currentTab];
      runInAction(() => {
        this.props.store.outputs.get(
          this.props.store.editorPanel.activeEditorId
        ).tableJson = {
          json: this.props.store.outputs.get(
            this.props.store.editorPanel.activeEditorId
          ).chartPanel.data,
          firstLine: 0,
          lastLine: 20
        };
      });
      this.props.store.outputPanel.currentTab =
        'TableView-' + this.props.store.editorPanel.activeEditorId;
      return;
    }
    editor = this.props.editorRefs[this.props.store.outputPanel.currentTab];
    const cm = editor.getCodeMirror();

    // Get the last line that we think is valid:
    const lineNumber = this.getLastLine(cm);
    if (!lineNumber) {
      // Throw error.
      runInAction(() => {
        NewToaster.show({
          message: globalString('output/editor/tabularError'),
          className: 'warning',
          icon: ''
        });
      });
    } else {
      const lines = { start: 0, end: 0, status: '' };

      const currentJson = this.props.getDocumentAtLine(
        this.props.store.outputPanel.currentTab,
        lineNumber,
        0,
        lines
      );

      this.props.api.initJsonView(
        currentJson,
        this.props.store.outputPanel.currentTab,
        'tableJson',
        lines,
        editor,
        false,
        defaultView
      );
    }
  }

  /**
   * Opens an enhancedJSON View.
   */
  @action.bound
  openJsonTreeView() {
    // Get the output instance:
    const editor = this.props.editorRefs[
      this.props.store.outputPanel.currentTab
    ];
    const cm = editor.getCodeMirror();

    // Get the last line that we think is valid:
    const lineNumber = this.getLastLine(cm);
    if (!lineNumber) {
      // Throw error.
      runInAction(() => {
        NewToaster.show({
          message: globalString('output/editor/tabularError'),
          className: 'warning',
          icon: ''
        });
      });
    } else {
      const lines = { start: 0, end: 0, status: '' };

      const currentJson = this.props.getDocumentAtLine(
        this.props.store.outputPanel.currentTab,
        lineNumber,
        0,
        lines
      );

      this.props.api.initJsonView(
        currentJson,
        this.props.store.outputPanel.currentTab,
        'enhancedJson',
        lines
      );
    }
  }

  /**
   * Create a new Chart view from the current view.
   * @param {boolean} fromTable - Determines whether or not the chart should be generated from the table view.
   */
  @action.bound
  openChartView(fromTable) {
    // Get the output instance
    let editor;
    if (fromTable) {
      editor = this.props.editorRefs[this.props.store.outputPanel.currentTab];
      runInAction(() => {
        this.props.api.outputApi.showChartPanel(
          this.props.store.editorPanel.activeEditorId,
          this.props.store.outputs.get(
            this.props.store.editorPanel.activeEditorId
          ).tableJson.json,
          'loaded'
        );
      });
      return;
    }
    editor = this.props.editorRefs[this.props.store.outputPanel.currentTab];

    const cm = editor.getCodeMirror();

    // Get the last line that we think is valid:
    const lineNumber = this.getLastLine(cm);
    if (!lineNumber) {
      // Throw error.
      runInAction(() => {
        NewToaster.show({
          message: globalString('output/editor/tabularError'),
          className: 'warning',
          icon: ''
        });
      });
    } else {
      const lines = { start: 0, end: 0, status: '' };

      const currentJson = this.props.getDocumentAtLine(
        this.props.store.outputPanel.currentTab,
        lineNumber,
        0,
        lines
      );

      StaticApi.parseTableJson(
        currentJson,
        lines,
        editor.getCodeMirror(),
        this.props.store.outputPanel.currentTab
      )
        .then(result => {
          runInAction(() => {
            this.props.api.outputApi.showChartPanel(
              this.props.store.outputPanel.currentTab,
              result,
              'loaded'
            );
          });
        })
        .catch(err => {
          const message = globalString('output/editor/parseJsonError') + err;
          runInAction(() => {
            NewToaster.show({
              message,
              className: 'danger',
              icon: ''
            });
          });

          runInAction(() => {
            this.props.api.outputApi.showChartPanel(
              this.props.store.outputPanel.currentTab,
              {},
              'error',
              message
            );
          });
        });
    }
  }

  render() {
    const currentOutput = this.props.store.outputPanel.currentTab;
    if (currentOutput.startsWith('TableView-')) {
      return this.renderTableToolbar();
    } else if (currentOutput.startsWith('Enhanced')) {
      return this.renderDefaultToolbar({
        jsonView: true,
        chartView: true,
        tableView: true
      });
    } else if (currentOutput.startsWith('Chart')) {
      return this.renderDefaultToolbar({ chartView: true, jsonView: true });
    } else if (
      this.props.store.outputs.get(this.props.store.outputPanel.currentTab)
    ) {
      return this.renderDefaultToolbar({ raw: true });
    }
    return (
      <nav className="pt-navbar pt-dark .modifier outputToolbar">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-navbar-heading">
            {globalString('output/headings/default')}
          </div>
        </div>
        <div className="pt-navbar-group pt-align-right">
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            inline
            content={globalString('output/toolbar/clear')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}
          >
            <AnchorButton
              className="pt-intent-danger circleButton clearOutputBtn"
              onClick={this.clearOutput}
            >
              <ClearOutputIcon className="dbKodaSVG" width={30} height={30} />
            </AnchorButton>
          </Tooltip>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            inline
            content={globalString('output/toolbar/showMore')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}
          >
            <AnchorButton
              className="showMoreBtn circleButton"
              onClick={this.showMore}
              disabled={
                this.props.store.outputPanel.currentTab == 'Default' ||
                this.props.store.outputPanel.currentTab.indexOf('Explain') >=
                  0 ||
                this.props.store.outputPanel.currentTab.indexOf('Details') >=
                  0 ||
                (this.props.store.outputs.get(
                  this.props.store.outputPanel.currentTab
                ) &&
                  this.props.store.outputs.get(
                    this.props.store.outputPanel.currentTab
                  ).cannotShowMore)
              }
            >
              <ShowMoreIcon className="dbKodaSVG" width={30} height={30} />
            </AnchorButton>
          </Tooltip>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            inline
            content={globalString('output/toolbar/save')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}
          >
            <AnchorButton
              className="saveOutputBtn circleButton"
              onClick={this.downloadOutput}
            >
              <SaveOutputIcon className="dbKodaSVG" width={30} height={30} />
            </AnchorButton>
          </Tooltip>
        </div>
      </nav>
    );
  }
}
