/**
* @Author: Michael Harrison <mike>
* @Date:   2017-03-15 13:34:55
* @Email:  mike@southbanksoftware.com
 * @Last modified by:   mike
 * @Last modified time: 2017-03-15 13:34:51
*/

/* eslint-disable react/prop-types */
/* eslint-disable react/sort-comp */
import React from 'react';
import {featherClient} from '~/helpers/feathers';
import {observer, inject} from 'mobx-react';
import {action} from 'mobx';
import {
  AnchorButton,
  Button,
  Intent,
  Position,
  Tooltip,
  Hotkey,
  Hotkeys,
  HotkeysTarget
} from '@blueprintjs/core';
import {NewToaster} from '#/common/Toaster';

@inject('store')
@observer
export default class Toolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <nav className="pt-navbar editorToolBar">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-button-group">
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content="Add a new Editor"
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-icon-add pt-intent-primary"
                loading={this.state.newConnectionLoading}
                onClick={this.addEditor} />
            </Tooltip>
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content="Add a new Editor"
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-icon-add pt-intent-primary"
                loading={this.state.newConnectionLoading}
                onClick={this.addEditor} />
            </Tooltip>
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content="Add a new Editor"
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-icon-add pt-intent-primary"
                loading={this.state.newConnectionLoading}
                onClick={this.addEditor} />
            </Tooltip>
          </div>
          <span className="pt-navbar-divider" />
          <Tooltip
            intent={Intent.NONE}
            hoverOpenDelay={1000}
            content="Enter a string to search for Editors"
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}>
            <div className="pt-input-group .modifier">
              <span className="pt-icon pt-icon-search" />
              <input
                className="pt-input"
                type="search"
                placeholder="Filter Tabs..."
                dir="auto"
                onChange={this.onFilterChanged} />
            </div>
          </Tooltip>
        </div>
      </nav>
    );
  }
}
