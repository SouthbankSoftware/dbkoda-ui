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
import { action, reaction } from 'mobx';
import { Intent, Tooltip, AnchorButton, Position } from '@blueprintjs/core';
import { featherClient } from '~/helpers/feathers';
import { OutputHotkeys } from '#/common/hotkeys/hotkeyList.jsx';
import EventLogging from '#/common/logging/EventLogging';
import { OutputToolbarContexts } from '../common/Constants';
import ClearOutputIcon from '../../styles/icons/clear-output-icon.svg';
import ShowMoreIcon from '../../styles/icons/show-more-icon.svg';
import SaveOutputIcon from '../../styles/icons/save-output-icon.svg';

/**
 * The OutputPanel toolbar, which hold the commands and actions specific to the output panel
 *  @param {Object} props - Holds the properties store (injected) and id (passed)
 */
@inject('store')
@observer
export default class Toolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      context: OutputToolbarContexts.DEFAULT,
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
      (executingShowMore) => {
        if (
          executingShowMore &&
          this.props.store.outputs.get(
            this.props.store.outputPanel.currentTab,
          ) &&
          !this.props.store.outputs.get(this.props.store.outputPanel.currentTab)
            .cannotShowMore
        ) {
          const command = 'it';
          console.log(
            'Sending data to feathers id ',
            this.props.store.outputs.get(
              this.props.store.outputPanel.currentTab,
            ).connId,
            ': ',
            command,
            '.',
          );
          this.props.store.editorToolbar.isActiveExecuting = true;
          this.props.store.editors.get(
            this.props.store.outputPanel.currentTab,
          ).executing = true;
          const service = featherClient().service('/mongo-shells');
          service.timeout = 30000;
          service.update(
            this.props.store.outputs.get(
              this.props.store.outputPanel.currentTab,
            ).connId,
            {
              shellId: this.props.store.outputs.get(
                this.props.store.outputPanel.currentTab,
              ).shellId,
              commands: command,
            },
          );
          this.props.store.outputs.get(
            this.props.store.outputPanel.currentTab,
          ).cannotShowMore = true;
        }
        this.props.store.outputPanel.executingShowMore = false;
      },
      { name: 'reactionOutputToolbarShowMore' },
    );

    /**
     * Reaction to clear the output console
     */
    reaction(
      () => this.props.store.outputPanel.clearingOutput,
      (clearingOutput) => {
        const currentTab = this.props.store.outputPanel.currentTab;
        if (clearingOutput && this.props.store.outputs.get(currentTab)) {
          this.props.store.outputs.get(currentTab).output = '';
          if (this.props.store.userPreferences.telemetryEnabled) {
            EventLogging.recordManualEvent(
              EventLogging.getTypeEnum().EVENT.OUTPUT_PANEL.CLEAR_OUTPUT,
              EventLogging.getFragmentEnum().OUTPUT,
              'User cleared Output',
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
              explains: undefined,
            });
            this.props.store.outputPanel.currentTab = editorKey;
          }
          this.props.store.outputPanel.clearingOutput = false;
        } else if (currentTab.indexOf('Details-') === 0) {
          console.log('Clear Details');
          this.props.store.editors.get(
            this.props.store.editorPanel.activeEditorId,
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
        }
      },
      { name: 'reactionOutputToolbarClearOutput' },
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
    console.log('executingShowMore = true');
    this.props.store.outputPanel.executingShowMore = true;
  }

  /**
   * Downloads the current contents of the Output Editor to a file
   */
  downloadOutput() {
    if (this.props.store.userPreferences.telemetryEnabled) {
      EventLogging.recordManualEvent(
        EventLogging.getTypeEnum().EVENT.OUTPUT_PANEL.SAVE_OUTPUT,
        EventLogging.getFragmentEnum().OUTPUT,
        'User saved Output',
      );
    }
    const data = new Blob(
      [
        this.props.store.outputs.get(this.props.store.outputPanel.currentTab)
          .output,
      ],
      { type: 'text/csv' },
    );
    const csvURL = window.URL.createObjectURL(data);
    const tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute(
      'download',
      `output-${this.props.store.outputPanel.currentTab}.js`,
    );
    tempLink.click();
  }

  /**
   * Render function for a Table View Toolbar.
   */
  renderTableToolbar() {
    return (
      <nav className="pt-navbar pt-dark .modifier outputToolbar">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-navbar-heading">
            {globalString('output/headings/table')}
          </div>
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
        <div className="pt-navbar-group pt-right-align" />
      </nav>
    );
  }

  render() {
    const currentOutput = this.props.store.outputPanel.currentTab;
    console.log(currentOutput);
    // Determine toolbar context.
    if (currentOutput.startsWith('TableView-')) {
      this.state.context = OutputToolbarContexts.TABLE_VIEW;
    } else {
      this.state.context = OutputToolbarContexts.DEFAULT;
    }

    switch (this.state.context) {
      case OutputToolbarContexts.TABLE_VIEW:
        return this.renderTableToolbar();
      default:
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
                      'Explain',
                    ) >= 0 ||
                    this.props.store.outputPanel.currentTab.indexOf(
                      'Details',
                    ) >= 0 ||
                    (this.props.store.outputs.get(
                      this.props.store.outputPanel.currentTab,
                    ) &&
                      this.props.store.outputs.get(
                        this.props.store.outputPanel.currentTab,
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
            <div className="pt-navbar-group pt-right-align" />
          </nav>
        );
    }
  }
}
