/**
* @Author: Chris Trott <chris>
* @Date:   2017-03-10T12:33:56+11:00
* @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-06-05T17:25:58+10:00
*/

import React from 'react';
import HotKey from 'react-shortcut';
import {inject, observer} from 'mobx-react';
import {action, reaction} from 'mobx';
import {
  Intent,
  Tooltip,
  AnchorButton,
  Position
} from '@blueprintjs/core';
import {featherClient} from '~/helpers/feathers';
import {OutputHotkeys} from '#/common/hotkeys/hotkeyList.jsx';
import EventLogging from '#/common/logging/EventLogging';
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
    this.downloadOutput = this
      .downloadOutput
      .bind(this);

    /**
     * Reaction to fire off execution of ShowMore (it) command
     */
    reaction(() => this.props.store.outputPanel.executingShowMore, (executingShowMore) => {
      if (executingShowMore && !this.props.store.outputs.get(this.props.store.outputPanel.currentTab).cannotShowMore) {
        const command = 'it';
        console.log('Sending data to feathers id ', this.props.store.outputs.get(this.props.store.outputPanel.currentTab).connId, ': ', command, '.');
        this.props.store.editorToolbar.isActiveExecuting = true;
        this
          .props
          .store
          .editors
          .get(this.props.store.outputPanel.currentTab)
          .executing = true;
        const service = featherClient().service('/mongo-shells');
        service.timeout = 30000;
        service.update(this.props.store.outputs.get(this.props.store.outputPanel.currentTab).connId, {
          shellId: this
            .props
            .store
            .outputs
            .get(this.props.store.outputPanel.currentTab)
            .shellId,
          commands: command
        });
        this
          .props
          .store
          .outputs
          .get(this.props.store.outputPanel.currentTab)
          .cannotShowMore = true;
      }
      this.props.store.outputPanel.executingShowMore = false;
    }, {name: 'reactionOutputToolbarShowMore'});

    /**
     * Reaction to clear the output console
     */
    reaction(() => this.props.store.outputPanel.clearingOutput, (clearingOutput) => {
      const currentTab = this.props.store.outputPanel.currentTab;
      if (clearingOutput && this.props.store.outputs.get(currentTab)) {
        this
          .props
          .store
          .outputs
          .get(currentTab)
          .output = '';
        if (this.props.store.userPreferences.telemetryEnabled) {
          EventLogging.recordManualEvent(EventLogging.getTypeEnum().EVENT.OUTPUT_PANEL.CLEAR_OUTPUT, EventLogging.getFragmentEnum().OUTPUT, 'User cleared Output');
        }
        this.props.store.outputPanel.clearingOutput = false;
      } else if (currentTab.indexOf('Explain-') === 0) {
        // close explain output
        const editorKey = currentTab.split('Explain-')[1];
        const editor = this
          .props
          .store
          .editors
          .get(editorKey);
        if (editor) {
          this
            .props
            .store
            .editors
            .set(editorKey, {
              ...editor,
              explains: undefined
            });
          this.props.store.outputPanel.currentTab = editorKey;
        }
        this.props.store.outputPanel.clearingOutput = false;
      } else if (currentTab.indexOf('Details-') === 0) {
        console.log('Clear Details');
        this.props.store.editors.get(this.props.store.editorPanel.activeEditorId).detailsView = undefined;
        const editorKey = currentTab.split('Details-')[1];
        this.props.store.outputPanel.currentTab = editorKey;
        this.props.store.outputPanel.clearingOutput = false;
      }
    }, {name: 'reactionOutputToolbarClearOutput'});
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
      EventLogging.recordManualEvent(EventLogging.getTypeEnum().EVENT.OUTPUT_PANEL.SAVE_OUTPUT, EventLogging.getFragmentEnum().OUTPUT, 'User saved Output');
    }
    const data = new Blob([
      this
        .props
        .store
        .outputs
        .get(this.props.store.outputPanel.currentTab)
        .output
    ], {type: 'text/csv'});
    const csvURL = window
      .URL
      .createObjectURL(data);
    const tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', `output-${this.props.store.outputPanel.currentTab}.js`);
    tempLink.click();
  }

  renderHotkeys() {
    return (
      <div className="OutputToolbarHotkeys">
        <HotKey
          keys={OutputHotkeys.clearOutput.keys}
          simultaneous
          onKeysCoincide={this.clearOutput} />
        <HotKey
          keys={OutputHotkeys.showMore.keys}
          simultaneous
          onKeysCoincide={this.showMore} />
      </div>
    );

/*      <Hotkeys>
        <Hotkey
          global
          combo="ctrl + l"
          label="Clear Output"
          onKeyDown={this.clearOutput} />
        <Hotkey global combo="shift + m" label="Show More" onKeyDown={this.showMore} />
        <Hotkey
          global
          combo="shift + x"
          label="Save Output"
          onKeyDown={this.downloadOutput} />
      </Hotkeys>
*/
  }

  render() {
    return (
      <nav className="pt-navbar pt-dark .modifier outputToolbar">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-navbar-heading">{globalString('output/heading')}</div>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            inline
            content={globalString('output/toolbar/clear')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}>
            <AnchorButton
              className="pt-intent-danger circleButton clearOutputBtn"
              onClick={this.clearOutput}>
              <ClearOutputIcon className="dbCodaSVG" width={30} height={30} />
            </AnchorButton>
          </Tooltip>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            inline
            content={globalString('output/toolbar/showMore')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}>
            <AnchorButton
              className="showMoreBtn circleButton"
              onClick={this.showMore}
              disabled={this.props.store.editorPanel.removingTabId == this.props.store.outputPanel.currentTab || this.props.store.outputPanel.currentTab == 'Default' || this
              .props
              .store
              .outputPanel
              .currentTab
              .indexOf('Explain') >= 0 || this
              .props
              .store
              .outputPanel
              .currentTab
              .indexOf('Details') >= 0 || this
              .props
              .store
              .outputs
              .get(this.props.store.outputPanel.currentTab)
              .cannotShowMore}>
              <ShowMoreIcon className="dbCodaSVG" width={30} height={30} />
            </AnchorButton>
          </Tooltip>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            inline
            content={globalString('output/toolbar/save')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}>
            <AnchorButton
              className="saveOutputBtn circleButton"
              onClick={this.downloadOutput}>
              <SaveOutputIcon className="dbCodaSVG" width={30} height={30} />
            </AnchorButton>
          </Tooltip>
        </div>
        <div className="pt-navbar-group pt-right-align" />
        {this.renderHotkeys()}
      </nav>
    );
  }
}
