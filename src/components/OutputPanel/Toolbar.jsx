/**
* @Author: Chris Trott <chris>
* @Date:   2017-03-10T12:33:56+11:00
* @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-04-21T09:55:31+10:00
*/

import React from 'react';
import {inject, observer} from 'mobx-react';
import {action, reaction} from 'mobx';
import {HotkeysTarget, Hotkeys, Hotkey, Intent, Tooltip, AnchorButton, Position} from '@blueprintjs/core';
import {featherClient} from '~/helpers/feathers';
import EventLogging from '#/common/logging/EventLogging';

/**
 * The OutputPanel toolbar, which hold the commands and actions specific to the output panel
 *  @param {Object} props - Holds the properties store (injected) and id (passed)
 */
@inject('store')
@observer
@HotkeysTarget
export default class Toolbar extends React.Component {
  constructor(props) {
    super(props);
    this.downloadOutput = this.downloadOutput.bind(this);

    /**
     * Reaction to fire off execution of ShowMore (it) command
     */
     reaction(
      () => this.props.store.outputPanel.executingShowMore,
      (executingShowMore) => {
        if (executingShowMore && !this.props.store.outputs.get(this.props.store.outputPanel.currentTab).cannotShowMore) {
          const command = 'it';
          console.log('Sending data to feathers id ', this.props.store.outputs.get(this.props.store.outputPanel.currentTab).id, ': ', command, '.');
          this.props.store.editorToolbar.isActiveExecuting = true;
          this.props.store.editors.get(this.props.store.outputPanel.currentTab).executing = true;
          const service = featherClient().service('/mongo-shells');
          service.timeout = 30000;
          service.update(this.props.store.outputs.get(this.props.store.outputPanel.currentTab).id, {
            shellId: this.props.store.outputs.get(this.props.store.outputPanel.currentTab).shellId,
            commands: command
          });
          this.props.store.outputs.get(this.props.store.outputPanel.currentTab).cannotShowMore = true;
        }
        this.props.store.outputPanel.executingShowMore = false;
      },
      { 'name': 'reactionOutputToolbarShowMore' }
    );

    /**
     * Reaction to clear the output console
     */
    reaction(
      () => this.props.store.outputPanel.clearingOutput,
      (clearingOutput) => {
        const currentab = this.props.store.outputPanel.currentTab;
        if (clearingOutput && this.props.store.outputs.get(this.props.store.outputPanel.currentTab)) {
            this.props.store.outputs.get(this.props.store.outputPanel.currentTab).output = '';
            if (this.props.store.userPreferences.telemetryEnabled) {
              EventLogging.recordManualEvent(EventLogging.getTypeEnum().EVENT.OUTPUT_PANEL.CLEAR_OUTPUT, EventLogging.getFragmentEnum().OUTPUT, 'User cleared Output');
            }
        } else if (currentab.indexOf('Explain-') === 0) {
          // close explain output
          const shellId = currentab.split('Explain-')[1];
          let editorKey = null;
          let editor = null;
          this.props.store.editors.forEach((value, key) => {
            if (value.shellId === shellId) {
              editorKey = key;
              editor = value;
            }
          });
          if (editor) {
            this.props.store.editors.set(editorKey, {...editor, explains: undefined});
            this.props.store.outputPanel.currentTab = editor.alias + ' (' + editor.shellId + ')';
          }
        }
        this.props.store.outputPanel.clearingOutput = false;
      },
      { 'name': 'reactionOutputToolbarClearOutput' }
    );
  }

  /**
   * Clears the output editor panel of all it's contents
   */
  @action.bound
  clearOutput() {
    this.props.store.outputPanel.clearingOutput = true;
    console.log(this.props.store.outputPanel.clearingOutput);
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
    if (this.props.store.userPreferences.telemetryEnabled) {
      EventLogging.recordManualEvent(EventLogging.getTypeEnum().EVENT.OUTPUT_PANEL.SAVE_OUTPUT, EventLogging.getFragmentEnum().OUTPUT, 'User saved Output');
    }
    const data = new Blob([this.props.store.outputs.get(this.props.store.outputPanel.currentTab).output], {type: 'text/csv'});
    const csvURL = window.URL.createObjectURL(data);
    const tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', `output-${this.props.store.outputPanel.currentTab}.js`);
    tempLink.click();
  }

  renderHotkeys() {
    return (
      <Hotkeys>
        <Hotkey
          global
          combo="ctrl + l"
          label="Clear Output"
          onKeyDown={this.clearOutput} />
        <Hotkey
          global
          combo="shift + m"
          label="Show More"
          onKeyDown={this.showMore} />
        <Hotkey
          global
          combo="shift + x"
          label="Save Output"
          onKeyDown={this.downloadOutput} />
      </Hotkeys>
    );
  }

  render() {
    return (
      <nav className="pt-navbar pt-dark .modifier outputToolbar">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-navbar-heading">Query Output</div>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            inline
            content="Clear Output Contents (Ctrl + L)"
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}>
            <AnchorButton
              className="pt-icon-disable pt-intent-warning clearOutputBtn"
              onClick={this.clearOutput} />
          </Tooltip>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            inline
            content="Show More (Shift + M)"
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}>
            <AnchorButton
              className="showMoreBtn pt-intent-primary"
              onClick={this.showMore}
              disabled={this.props.store.outputPanel.currentTab.indexOf('Explain') >= 0 || this.props.store.outputs.get(
                          this.props.store.outputPanel.currentTab
                        ).cannotShowMore} >
              Show More
            </AnchorButton>
          </Tooltip>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            inline
            content="Save Output (Shift + X)"
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}>
            <AnchorButton
              className="saveOutputBtn pt-icon-floppy-disk pt-intent-primary"
              onClick={this.downloadOutput} />
          </Tooltip>
        </div>
        <div className="pt-navbar-group pt-right-align" />
      </nav>
    );
  }
}
