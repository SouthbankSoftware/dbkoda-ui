/**
* @Author: Chris Trott <chris>
* @Date:   2017-03-10T12:33:56+11:00
* @Email:  chris@southbanksoftware.com
* @Last modified by:   chris
* @Last modified time: 2017-03-16T11:56:39+11:00
*/

import React from 'react';
import {inject, observer} from 'mobx-react';
import {action} from 'mobx';
import {featherClient} from '~/helpers/feathers';
import {NewToaster} from '../common/Toaster';
import {HotkeysTarget, Hotkeys, Hotkey, Intent, Button} from '@blueprintjs/core';

@inject('store')
@observer
@HotkeysTarget
export default class Toolbar extends React.Component {
  constructor(props) {
    super(props);
  }

  @action.bound
  clearOutput() {
    this.props.store.output.output = '';
  }

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
  }

  render() {
    return (
      <nav className="pt-navbar pt-dark .modifier outputToolbar">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-navbar-heading">Query Output</div>
          <Button
            className="pt-button pt-icon-disable pt-intent-warning clearOutputBtn"
            onClick={this.clearOutput}
            title="Clear Output (Shortcut+Keys)" />
          <Button
            className="pt-button showMoreBtn pt-intent-primary"
            onClick={this.showMore}
            disabled={this.props.store.output.cannotShowMore}
            title="Show More (Shortcut+Keys)">
            Show More
          </Button>
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
      </Hotkeys>
    );
  }
}
