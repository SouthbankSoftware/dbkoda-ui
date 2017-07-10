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
* @Author: Michael Harrison <mike>
* @Date:   2017-04-10 14:32:37
* @Email:  mike@southbanksoftware.com
* @Last modified by:   mike
* @Last modified time: 2017-04-10 14:32:40
*/

/* eslint-disable react/no-string-refs */
/* eslint-disable react/sort-comp */
import React from 'react';
import {inject, observer} from 'mobx-react';
import {action} from 'mobx';
import {AnchorButton, Checkbox} from '@blueprintjs/core';
import EventLogging from '#/common/logging/EventLogging';

/**
 * Panel for wrapping the Editor View and EditorToolbar.
 * @extends {React.Component}
 */
@inject('store')
@observer
export default class Panel extends React.Component {
  static propTypes = {};
  constructor(props) {
    super(props);
    this.state = {};
  }

  @action.bound
  openConnection() {
    if (this.props.store.userPreferences.telemetryEnabled) {
      EventLogging.recordManualEvent(EventLogging.getTypeEnum().EVENT.CONNECTION_PANEL.NEW_PROFILE.OPEN_DIALOG, EventLogging.getFragmentEnum().PROFILES, 'User opened the New Connection Profile drawer.');
    }
    this.props.store.profileList.selectedProfile = null;
    this
      .props
      .store
      .showConnectionPane();
  }

  @action.bound
  telemetryEnabledChanged() {
    console.log('Telemetry Enabled Before:', this.props.store.userPreferences.telemetryEnabled);
    if (this.props.store.userPreferences.telemetryEnabled) {
      this.props.store.userPreferences.telemetryEnabled = false;
    } else {
      this.props.store.userPreferences.telemetryEnabled = true;
    }
    console.log('Telemetry Enabled After:', this.props.store.userPreferences.telemetryEnabled);
  }

  @action.bound
  chooseTheme() {
    this.props.store.welcomePage.currentContent = 'Choose Theme';
  }

  @action.bound
  welcomePage() {
    this.props.store.welcomePage.currentContent = 'Welcome';
  }

  @action.bound
  learnKeyboardShortcuts() {
    this.props.store.welcomePage.currentContent = 'Keyboard Shortcuts';
  }

  render() {
    console.log('Telemetry Enabled:', this.props.store.userPreferences.telemetryEnabled);
    return (
      <div className="welcomeMenu">
        <h2>
          Get to know dbKoda!
        </h2>
        <div className="welcomeButtons">
          <div className="welcomeButtonWrapper">
            <AnchorButton
              className="welcomeMenuButton openConnectionButton"
              onClick={this.openConnection}>Open Connection</AnchorButton>
          </div>
          <div className="welcomeButtonWrapper">
            {(this.props.store.welcomePage.currentContent == 'Welcome')}
            <AnchorButton
              className="welcomeMenuButton welcomePageButton"
              onClick={this.welcomePage}>Welcome Page</AnchorButton>
          </div>
          <div className="welcomeButtonWrapper">
            <AnchorButton
              className="welcomeMenuButton learnKeyboardShortcutsButton"
              onClick={this.learnKeyboardShortcuts}>Keyboard Shortcuts</AnchorButton>
          </div>
        </div>
        <div className="welcomeMenuOptOut">
          <Checkbox checked={this.props.store.userPreferences.telemetryEnabled} onChange={this.telemetryEnabledChanged} />
          <p>Send Telemetry Data to dbKoda?</p>
        </div>
      </div>
    );
  }
}
