/**
* @Author: Chris Trott <chris>
* @Date:   2017-03-10T12:33:56+11:00
* @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-03-21T16:49:20+11:00
*/

import React from 'react';
import {inject, observer} from 'mobx-react';
import {action, reaction} from 'mobx';
import {featherClient} from '~/helpers/feathers';
import {NewToaster} from '../common/Toaster';
import {HotkeysTarget, Hotkeys, Hotkey, Intent, Tooltip, AnchorButton, Position} from '@blueprintjs/core';


/**
 * The OutputPanel toolbar, which hold the commands and actions specific to the output panel
 *
 */
@inject('store')
@observer
@HotkeysTarget
export default class Toolbar extends React.Component {
  constructor(props) {
    super(props);
    this.downloadOutput = this.downloadOutput.bind(this);
  }
  /**
   * Clears the output editor panel of all it's contents
   */
  @action.bound
  clearOutput() {
    this.props.store.outputs.get(this.props.id).output = '';
  }

  /**
   * Sends the 'it' command back to the shell on the controller to get more results
   */
  @action.bound
  showMore() {
    const command = 'it';
    console.log('Sending data to feathers id ', this.props.store.editorPanel.activeDropdownId, ': ', command, '.');
    const service = featherClient().service('/mongo-shells');
    service.timeout = 30000;
    service.update(this.props.store.editorPanel.activeDropdownId, {
      shellId: parseInt(this.props.store.editorPanel.activeDropdownId) + 1, // eslint-disable-line
      commands: command
    });
    this.props.store.outputs.get(this.props.id).cannotShowMore = true;
  }

  downloadOutput() {
    var data   = new Blob([this.props.store.outputs.get(this.props.id).output], {type: 'text/csv'}),
    csvURL = window.URL.createObjectURL(data),
    tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download',`output-${this.props.id}.js`);
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
            content="Clear Output Contents (Shift + C)"
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}>
            <AnchorButton
              className="pt-icon-disable pt-intent-warning clearOutputBtn"
              onClick={this.clearOutput} />
          </Tooltip>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            content="Show More (Shift + M)"
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}>
            <AnchorButton
              className="showMoreBtn pt-intent-primary"
              onClick={this.showMore}
              disabled={this.props.store.outputs.get(this.props.id).cannotShowMore} >
              Show More
            </AnchorButton>
          </Tooltip>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
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
          combo="shift + c"
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
            onKeyDown={this.showMore} />
      </Hotkeys>
    );
  }
}
