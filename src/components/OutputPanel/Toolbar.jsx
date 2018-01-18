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
 * @Last modified by:   guiguan
 * @Last modified time: 2017-09-27T08:44:23+10:00
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
  EditableText
} from '@blueprintjs/core';
import { featherClient } from '~/helpers/feathers';
import { OutputHotkeys } from '#/common/hotkeys/hotkeyList.jsx';
import { NewToaster } from '#/common/Toaster';
import StaticApi from '~/api/static';
import EventLogging from '#/common/logging/EventLogging';
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
    if (this.props.store.outputPanel.currentTab.startsWith('TableView-')) {
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
        const currentTab = this.props.store.outputPanel.currentTab;
        if (clearingOutput && this.props.store.outputs.get(currentTab)) {
          this.props.store.outputs.get(currentTab).output = '';
          if (this.props.config.settings.telemetryEnabled) {
            EventLogging.recordManualEvent(
              EventLogging.getTypeEnum().EVENT.OUTPUT_PANEL.CLEAR_OUTPUT,
              EventLogging.getFragmentEnum().OUTPUT,
              'User cleared Output'
            );
          }
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
        } else if (currentTab.startsWith('Chart-')) {
          const editorKey = currentTab.split('Chart-')[1];
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
  }

  componentDidMount() {
    // Add hotkey bindings for this component:
    Mousetrap.bindGlobal(OutputHotkeys.clearOutput.keys, this.clearOutput);
    Mousetrap.bindGlobal(OutputHotkeys.showMore.keys, this.showMore);
  }
  componentWillUnmount() {
    Mousetrap.unbindGlobal(OutputHotkeys.clearOutput.keys, this.clearOutput);
    Mousetrap.unbindGlobal(OutputHotkeys.showMore.keys, this.showMore);
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
  downloadOutput() {
    const data = new Blob(
      [
        this.props.store.outputs.get(this.props.store.outputPanel.currentTab)
          .output
      ],
      { type: 'text/csv' }
    );
    const csvURL = window.URL.createObjectURL(data);
    const tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute(
      'download',
      `output-${this.props.store.outputPanel.currentTab}.js`
    );
    tempLink.click();
  }

  /**
   * Render function for the raw toolbar.
   */
  renderRawToolbar() {
    return (
      <nav className="pt-navbar pt-dark .modifier outputToolbar">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-navbar-heading">
            {globalString('output/headings/default')}
          </div>
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
              onClick={this.openJsonTreeView}
            >
              <EnhanceJSONIcon className="dbKodaSVG" width={30} height={30} />
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
              onClick={this.openTableView}
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
              onClick={this.openChartView}
            >
              <ChartIcon className="dbKodaSVG" width={30} height={30} />
            </AnchorButton>
          </Tooltip>
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

    return (
      <nav className="pt-navbar pt-dark .modifier outputToolbar">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-navbar-heading">
            {globalString('output/headings/table')}
          </div>
        </div>
        <div className="pt-navbar-group pt-align-right">
          {/* <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            inline
            content={globalString('output/toolbar/save')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}
          >
            <AnchorButton
              className="saveOutputBtn circleButton"
              onClick={() => {
                this.props.api.outputApi.saveTableData();
              }}
            >
              <SaveOutputIcon className="dbKodaSVG" width={30} height={30} />
            </AnchorButton>
          </Tooltip> */}
          {this.props.store.outputs.get(editor.id).tableJson.database && (
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
          {this.props.store.outputs.get(editor.id).tableJson.database && (
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
        </div>
      </nav>
    );
  }

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

  @action.bound
  openTableView() {
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
        'tableJson',
        lines,
        editor,
        false
      );
    }
  }

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

  @action.bound
  openChartView() {
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
    // Determine toolbar context.
    if (currentOutput.startsWith('TableView-')) {
      this.state.context = OutputToolbarContexts.TABLE_VIEW;
    } else if (
      this.props.store.outputs.get(this.props.store.outputPanel.currentTab)
    ) {
      this.state.context = OutputToolbarContexts.RAW;
    } else {
      this.state.context = OutputToolbarContexts.DEFAULT;
    }
    switch (this.state.context) {
      case OutputToolbarContexts.TABLE_VIEW:
        return this.renderTableToolbar();
      case OutputToolbarContexts.RAW:
        return this.renderRawToolbar();
      default:
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
                  <ClearOutputIcon
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
                content={globalString('output/toolbar/showMore')}
                tooltipClassName="pt-dark"
                position={Position.BOTTOM}
              >
                <AnchorButton
                  className="showMoreBtn circleButton"
                  onClick={this.showMore}
                  disabled={
                    this.props.store.outputPanel.currentTab == 'Default' ||
                    this.props.store.outputPanel.currentTab.indexOf(
                      'Explain'
                    ) >= 0 ||
                    this.props.store.outputPanel.currentTab.indexOf(
                      'Details'
                    ) >= 0 ||
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
                  <SaveOutputIcon
                    className="dbKodaSVG"
                    width={30}
                    height={30}
                  />
                </AnchorButton>
              </Tooltip>
            </div>
          </nav>
        );
    }
  }
}
