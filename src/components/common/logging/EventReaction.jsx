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
    const editorListObserver = observe(store.editors, change => this.observeEditorList(change, typeEnum, fragmentEnum));
    const editorPanelObserver = observe(store.editorPanel, change => this.observeEditorPanel(change, typeEnum, fragmentEnum));
    const profileListObserver = observe(store.profiles, change => this.observeProfileList(change, typeEnum, fragmentEnum));

    console.log('Logging framework started...');
  }

  observeEditorList(change, typeEnum, fragmentEnum) {
    if (this.props.store.userPreferences.telemetryEnabled) {
      switch (change.type) {
        case 'add':
          EventLogging.recordEvent(typeEnum.EVENT.EVENT, fragmentEnum.EDITORS, 'Editor added to Editors Map.', change);
          break;
        case 'remove':
          EventLogging.recordEvent(typeEnum.EVENT.EVENT, fragmentEnum.EDITORS, 'Editor removed from Editors Map.', change);
          break;
        default:
          EventLogging.recordEvent(typeEnum.EVENT.EVENT, fragmentEnum.EDITORS, 'Unknown Change on Editors Map.', change);
          break;
      }
    }
  }

  observeEditorPanel(change, typeEnum, fragmentEnum) {
    if (this.props.store.userPreferences.telemetryEnabled) {
      switch (change.type) {
        case 'update':
          switch (change.name) {
            case 'creatingNewEditor':
              if (change.oldValue == 'false') {
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
              if (change.oldValue == 'false') {
                EventLogging.recordEvent(typeEnum.EVENT.EDITOR_PANEL.TOOLBAR.EXECUTE_ALL.START, fragmentEnum.EDITOR_PANEL, 'Execute All event Started.', change);
              } else {
                EventLogging.recordEvent(typeEnum.EVENT.EDITOR_PANEL.TOOLBAR.EXECUTE_ALL.FINISH, fragmentEnum.EDITOR_PANEL, 'Execute All event finished.', change);
              }
              break;
            case 'executingEditorLines':
              if (change.oldValue == 'false') {
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

  observeProfileList(change, typeEnum, fragmentEnum) {
    if (this.props.store.userPreferences.telemetryEnabled) {
      switch (change.type) {
        case 'add':
          EventLogging.recordEvent(typeEnum.EVENT.EVENT, fragmentEnum.PROFILES, 'Profile added to Profiles Map', change);
          break;
        case 'remove':
          EventLogging.recordEvent(typeEnum.EVENT.EVENT, fragmentEnum.PROFILES, 'Profile removed from Profile Map', change);
          break;
        default:
          EventLogging.recordEvent(typeEnum.EVENT.EVENT, fragmentEnum.PROFILES, 'Unknown Change on Profiles Map.', change);
          break;
      }
    }
  }
  render() {
    return <div/>;
  }
}
