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
 *
 * @Author: Michael Harrison <mike>
 * @Date:   2017-04-10 14:32:37
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-09-28T11:48:19+10:00
 */

/* eslint-disable react/no-string-refs */
/* eslint-disable react/sort-comp */
import React from 'react';
import {inject, observer} from 'mobx-react';
import {action} from 'mobx';
import {AnchorButton, Checkbox} from '@blueprintjs/core';
import EventLogging from '#/common/logging/EventLogging';
import KeyboardIcon from '../../../styles/icons/keyboard-icon.svg';
import OpenFolderIcon from '../../../styles/icons/open-folder-icon.svg';
import ConfigDatabaseIcon from '../../../styles/icons/config-database-icon-2.svg';

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

  @action.bound
  openConfigTab() {
    this.props.store.configPage.isOpen = true;
    this.props.store.editorPanel.activeEditorId = 'Config';
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
            {(this.props.store.welcomePage.currentContent == 'Welcome')}
            <AnchorButton
              className="welcomeMenuButton welcomePageButton"
              onClick={this.welcomePage}>Welcome Page</AnchorButton>
          </div>
          <div className="welcomeButtonWrapper">
            <AnchorButton
              className="welcomeMenuButton openConnectionButton"
              onClick={this.openConnection}>
              <OpenFolderIcon className="dbKodaSVG" width={30} height={30} />
              Open Connection</AnchorButton>
          </div>
          <div className="welcomeButtonWrapper">
            <AnchorButton
              className="welcomeMenuButton learnKeyboardShortcutsButton"
              onClick={this.learnKeyboardShortcuts}>
              <KeyboardIcon className="dbKodaSVG" width={30} height={30} />
              Keyboard Shortcuts</AnchorButton>
          </div>
        </div>
        {
          process.env.NODE_ENV === 'development' &&
          <div className="welcomeMenuConfig">
            <div className="welcomeButtons">
              <div className="welcomeButtonWrapper">
                <AnchorButton className="welcomeMenuButton openConfigBtn" onClick={this.openConfigTab}>
                  <ConfigDatabaseIcon className="dbKodaSVG" width={30} height={30} />
                  Preferences
                </AnchorButton>
              </div>
            </div>
          </div>
        }
        {
          process.env.NODE_ENV !== 'development' &&
          <div className="welcomeMenuOptOut"><Checkbox checked={this.props.store.userPreferences.telemetryEnabled} onChange={this.telemetryEnabledChanged} /><p>Send Telemetry Data to dbKoda?</p></div>
        }
      </div>
    );
  }
}
