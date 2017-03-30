/**
* @Author: Chris Trott <chris>
* @Date:   2017-03-10T12:33:56+11:00
* @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-03-27T15:24:24+11:00
*/

import React from 'react';
import {inject, observer} from 'mobx-react';
import {action, reaction} from 'mobx';
import {featherClient} from '~/helpers/feathers';
import {NewToaster} from '../common/Toaster';
import EventLogging from '#/common/logging/EventLogging';
import {HotkeysTarget, Hotkeys, Hotkey, Intent, Tooltip, AnchorButton, Position} from '@blueprintjs/core';


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
    const reactionToExecutingCmd = reaction(
      () => this.props.store.outputPanel.executingShowMore,
      executingShowMore => {
        if(!this.props.store.outputs.get(this.props.title).cannotShowMore) {
          const command = 'it';
          console.log('Sending data to feathers id ', this.props.store.outputs.get(this.props.title).id, ': ', command, '.');
          const service = featherClient().service('/mongo-shells');
          service.timeout = 30000;
          service.update(this.props.store.outputs.get(this.props.title).id, {
            shellId: this.props.store.outputs.get(this.props.title).shellId, // eslint-disable-line
            commands: command
          });
          this.props.store.outputs.get(this.props.title).cannotShowMore = true;
        }
        this.props.store.outputPanel.executingShowMore = false;
      },
      { "name": "reactionOutputToolbarShowMore" }
    );

    /**
     * Reaction to clear the output console
     */
    const reactionToClearingOutput = reaction(
      () => this.props.store.outputPanel.clearingOutput,
      clearingOutput => {
        if (this.props.store.outputPanel.clearingOutput) {
          this.props.store.outputs.get(this.props.title).output = '';
          if (this.props.store.userPreferences.telemetryEnabled) {
            EventLogging.recordManualEvent(EventLogging.getTypeEnum().EVENT.OUTPUT_PANEL.CLEAR_OUTPUT, EventLogging.getFragmentEnum().OUTPUT, 'User cleared Output');
          }
          this.props.store.outputPanel.clearingOutput = false;
        }
      }
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
    var data   = new Blob([this.props.store.outputs.get(this.props.title).output], {type: 'text/csv'}),
    csvURL = window.URL.createObjectURL(data),
    tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download',`output-${this.props.title}.js`);
    tempLink.click();
  }

  render() {
    return (
      <nav className="pt-navbar pt-dark .modifier outputToolbar">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-navbar-heading">Query Output</div>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            inline={true}
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
            inline={true}
            content="Show More (Shift + M)"
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}>
            <AnchorButton
              className="showMoreBtn pt-intent-primary"
              onClick={this.showMore}
              disabled={this.props.store.outputs.get(this.props.title).cannotShowMore} >
              Show More
            </AnchorButton>
          </Tooltip>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            inline={true}
            content="Save Output (Shift + X)"
            tooltipClassName="pt-dark"
            positioon={Position.BOTTOM}>
            <AnchorButton
              className="saveOutputBtn pt-icon-floppy-disk pt-intent-primary"
              onClick={this.downloadOutput}>
            </AnchorButton>
          </Tooltip>
        </div>
        <div className="pt-navbar-group pt-right-align" />
      </nav>
    );
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
}
