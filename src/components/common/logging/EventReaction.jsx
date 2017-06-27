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
 * @Author: mike
 * @Date:   2017-03-28 16:13:50
 * @Last modified by:   mike
 * @Last modified time: 2017-03-28 16:14:04
 */
/* eslint-disable react/no-string-refs */
/* eslint-disable no-unused-vars */
import {observer, inject} from 'mobx-react';
import {observe, action, reaction} from 'mobx';
import EventLogging from './EventLogging.js';

const React = require('react');
const _ = require('lodash');

const instance = false;
/**
 * Panel for wrapping the Editor View and EditorToolbar.
 */
@inject('store')
@observer
export default class EventReaction extends React.Component {
  constructor(props) {
    super(props);

    const typeEnum = EventLogging.getTypeEnum();
    const fragmentEnum = EventLogging.getFragmentEnum();
    const store = this.props.store;
    const editorPanelObserver = observe(store.editorPanel, change => this.observeEditorPanel(change, typeEnum, fragmentEnum));
    const profilePanelObserver = observe(store.profileList, change => this.observeProfilePanel(change, typeEnum, fragmentEnum));
    const profileOutputObserver = observe(store.outputPanel, change => this.observeOutputPanel(change, typeEnum, fragmentEnum));
    const userPreferencesObserver = observe(store.userPreferences, change => this.observeUserPreferences(change, typeEnum, fragmentEnum));

    if (this.props.store.userPreferences.telemtryEnabled) {
      EventLogging.recordEvent(typeEnum.EVENT.APP.OPEN, fragmentEnum.PROFILES, 'dbKoda App started.', change);
    }
  }

  observeEditorPanel(change, typeEnum, fragmentEnum) {
    if (this.props.store.userPreferences.telemetryEnabled) {
      switch (change.type) {
        case 'update':
          switch (change.name) {
            case 'creatingNewEditor':
              if (!change.oldValue) {
                EventLogging.recordEvent(typeEnum.EVENT.EDITOR_PANEL.NEW_EDITOR.START, fragmentEnum.EDITOR_PANEL, 'Create new Editor event Started.', change);
              } else {
                EventLogging.recordEvent(typeEnum.EVENT.EDITOR_PANEL.NEW_EDITOR.FINISH, fragmentEnum.EDITOR_PANEL, 'Create new Editor event Finished.', change);
              }
              break;
            case 'activeEditorId':
              EventLogging.recordEvent(typeEnum.EVENT.EDITOR_PANEL.CHANGE_ACTIVE_EDITOR, fragmentEnum.EDITOR_PANEL, 'Swapped Editor Tab.', change);
              break;
            case 'activeDropdownId':
              EventLogging.recordEvent(typeEnum.EVENT.EDITOR_PANEL.CHANGE_DROPDOWN, fragmentEnum.EDITOR_PANEL, 'Swapped Dropdown Selection.', change);
              break;
            case 'executingEditorAll':
              if (!change.oldValue) {
                EventLogging.recordEvent(typeEnum.EVENT.EDITOR_PANEL.TOOLBAR.EXECUTE_ALL.START, fragmentEnum.EDITOR_PANEL, 'Execute All event Started.', change);
              } else {
                EventLogging.recordEvent(typeEnum.EVENT.EDITOR_PANEL.TOOLBAR.EXECUTE_ALL.FINISH, fragmentEnum.EDITOR_PANEL, 'Execute All event finished.', change);
              }
              break;
            case 'executingEditorLines':
              if (!change.oldValue) {
                EventLogging.recordEvent(typeEnum.EVENT.EDITOR_PANEL.TOOLBAR.EXECUTE_LINE.START, fragmentEnum.EDITOR_PANEL, 'Execute Line event Started.', change);
              } else {
                EventLogging.recordEvent(typeEnum.EVENT.EDITOR_PANEL.TOOLBAR.EXECUTE_LINE.FINISH, fragmentEnum.EDITOR_PANEL, 'Execute Line event finished.', change);
              }
              break;
            case 'tabFilter':
              EventLogging.recordEvent(typeEnum.EVENT.EDITOR_PANEL.CHANGE_FILTER, fragmentEnum.EDITOR_PANEL, 'Editor Filter Modified.', change);
              break;
            default:
              EventLogging.recordEvent(typeEnum.EVENT.EVENT, fragmentEnum.EDITOR_PANEL, 'Unknown Update on EditorPanel.', change);
              break;
          }
          break;
        default:
          EventLogging.recordEvent(typeEnum.EVENT.EVENT, fragmentEnum.EDITOR_PANEL, 'Unknown Change on EditorPanel.', change);
          break;
      }
    }
  }

  observeProfilePanel(change, typeEnum, fragmentEnum) {
    if (this.props.store.userPreferences.telemetryEnabled) {
      switch (change.type) {
        case 'update':
          switch (change.name) {
            case 'creatingNewProfile':
              if (!change.oldValue) {
                EventLogging.recordEvent(typeEnum.EVENT.CONNECTION_PANEL.NEW_PROFILE.START, fragmentEnum.PROFILES, 'Create new Profile event Started.', change);
              } else {
                EventLogging.recordEvent(typeEnum.EVENT.CONNECTION_PANEL.NEW_PROFILE.FINISH, fragmentEnum.PROFILES, 'Create new Profile event Finished.', change);
              }
              break;
            case 'selectedProfile':
              EventLogging.recordEvent(typeEnum.EVENT.CONNECTION_PANEL.CHANGE_PROFILE_SELECTION, fragmentEnum.PROFILES, 'Change Profile Event.', change);
              break;
            default:
              EventLogging.recordEvent(typeEnum.EVENT.EVENT, fragmentEnum.PROFILES, 'Unknown Update on ProfilePanel.', change);
              break;
          }
          break;
        default:
          EventLogging.recordEvent(typeEnum.EVENT.EVENT, fragmentEnum.PROFILES, 'Unknown Change on ProfilePanel.', change);
          break;
      }
    }
  }

  observeOutputPanel(change, typeEnum, fragmentEnum) {
    if (this.props.store.userPreferences.telemetryEnabled) {
      switch (change.type) {
        case 'update':
          switch (change.name) {
            case 'executingShowMore':
              if (!change.oldValue) {
                EventLogging.recordEvent(typeEnum.EVENT.OUTPUT_PANEL.SHOW_MORE.START, fragmentEnum.PROFILES, 'Show More Event Started.', change);
              } else {
                EventLogging.recordEvent(typeEnum.EVENT.OUTPUT_PANEL.SHOW_MORE.FINISH, fragmentEnum.PROFILES, 'Show More Event Finished.', change);
              }
              break;
            case 'executingTerminalCmd':
              if (!change.oldValue) {
                EventLogging.recordEvent(typeEnum.EVENT.OUTPUT_PANEL.EXECUTE_TERMINAL.START, fragmentEnum.PROFILES, 'Execute Terminal Event Started', change);
              } else {
                EventLogging.recordEvent(typeEnum.EVENT.OUTPUT_PANEL.EXECUTE_TERMINAL.FINISH, fragmentEnum.PROFILES, 'Execute Terminal Event Finished', change);
              }
              break;
            default:
              EventLogging.recordEvent(typeEnum.EVENT.EVENT, fragmentEnum.OUTPUT, 'Unknown Update on OutputPanel.', change);
              break;
          }
          break;
        default:
          EventLogging.recordEvent(typeEnum.EVENT.EVENT, fragmentEnum.OUTPUT, 'Unknown Change on OutputPanel.', change);
          break;
      }
    }
  }

  observeUserPreferences(change, typeEnum, fragmentEnum) {
    if (this.props.store.userPreferences.telemetryEnabled) {
      switch (change.type) {
        case 'update':
          switch (change.name) {
            case 'telemetryEnabled':
              if (change.oldValue) {
                EventLogging.recordEvent(typeEnum.EVENT.USER_PREFERENCES.TELEMETRY.DISABLED, fragmentEnum.PREFERENCES, 'Telemtry Disabled.', change);
              } else {
                EventLogging.recordEvent(typeEnum.EVENT.USER_PREFERENCES.TELEMETRY.ENABLED, fragmentEnum.PREFERENCES, 'Telemtry Enabled.', change);
              }
              break;
            default:
              EventLogging.recordEvent(typeEnum.EVENT.EVENT, fragmentEnum.EDITOR_PANEL, 'Unknown Update on UserPreferences.', change);
              break;
          }
          break;
        default:
          EventLogging.recordEvent(typeEnum.EVENT.EVENT, fragmentEnum.EDITOR_PANEL, 'Unknown Change on UserPreferences.', change);
          break;
      }
    }
  }

  render() {
    return <div />;
  }
}
