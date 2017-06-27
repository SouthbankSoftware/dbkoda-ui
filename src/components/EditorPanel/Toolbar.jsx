/**
 * @Author: Michael Harrison <mike>
 * @Date:   2017-03-14 15:54:01
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-06-27T15:29:39+10:00
 */
/* eslint-disable react/prop-types */
/* eslint-disable react/sort-comp */
import _ from 'lodash';
import React from 'react';
import Mousetrap from 'mousetrap';
import 'mousetrap-global-bind';
import {featherClient} from '~/helpers/feathers';
import {inject, observer} from 'mobx-react';
import {action, observable, reaction, runInAction, when} from 'mobx';
import uuidV1 from 'uuid';
import path from 'path';
import {AnchorButton, Intent, Position, Tooltip} from '@blueprintjs/core';
import {NewToaster} from '#/common/Toaster';
import EventLogging from '#/common/logging/EventLogging';
import {GlobalHotkeys} from '#/common/hotkeys/hotkeyList.jsx';
import './Panel.scss';
import {Broker, EventType} from '../../helpers/broker';
import ExplainPopover from './ExplainPopover';
import ExecuteLineIcon from '../../styles/icons/execute-icon.svg';
import ExecuteAllIcon from '../../styles/icons/execute-all-icon.svg';
import StopExecutionIcon from '../../styles/icons/stop-execute-icon.svg';
import AddIcon from '../../styles/icons/add-icon.svg';
import OpenFileIcon from '../../styles/icons/open-icon.svg';
import SaveFileIcon from '../../styles/icons/save-icon.svg';
import {ProfileStatus} from '../common/Constants';

const {dialog, BrowserWindow} = IS_ELECTRON
  ? window
    .require('electron')
    .remote
  : {};

const FILE_FILTERS = [
  {
    name: 'JavaScript',
    extensions: ['js']
  }
];

/**
 * Defines the Toolbar for the Tabbed Editor Panel.
 */
@inject('store')
@observer
export default class Toolbar extends React.Component {
  constructor(props) {
    super(props);

    this.addEditor = this
      .addEditor
      .bind(this);
    this.executeLine = this
      .executeLine
      .bind(this);
    this.executeAll = this
      .executeAll
      .bind(this);
    this.explainPlan = this
      .explainPlan
      .bind(this);
    this.onDropdownChanged = this
      .onDropdownChanged
      .bind(this);
    this.openFile = this
      .openFile
      .bind(this);
    this.saveFile = this
      .saveFile
      .bind(this);
  }

  componentWillMount() {
    Broker.on(EventType.NEW_PROFILE_CREATED, (profile) => {
      this.profileCreated(profile);
    });
    Broker.on(EventType.RECONNECT_PROFILE_CREATED, (profile) => {
      this.profileCreated(profile);
    });

    // reaction to add a new editor when a new tree action open a new form. This
    // will create a new editor.
    this.reactionToNewEditorForTreeAction = reaction(() => this.props.store.editorToolbar.newEditorForTreeAction, () => {
      if (this.props.store.editorToolbar.newEditorForTreeAction) {
        this.addEditor({});
      }
    });

    this.reactionToNewEditorForProfileId = reaction(() => this.props.store.editorToolbar.newEditorForProfileId, () => {
      if (this.props.store.editorToolbar.newEditorForProfileId != '') {
        this.props.store.editorPanel.activeDropdownId = this.props.store.editorToolbar.newEditorForProfileId;
        this.addEditor({});
        this.props.store.editorToolbar.newEditorForProfileId = '';
      }
    });

    if (IS_ELECTRON) {
      window
        .require('electron')
        .ipcRenderer
        .on('command', (event, message) => {
          if (message == 'openFile') {
            this.openFile();
          } else if (message == 'saveFile') {
            this.saveFile();
          }
        });
    }
  }

  componentWillUnmount() {
    this.reactionToNewEditorForTreeAction();
    this.reactionToNewEditorForProfileId();
    Mousetrap.unbindGlobal(GlobalHotkeys.editorToolbarHotkeys.executeLine.keys, this.executeLine);
    Mousetrap.unbindGlobal(GlobalHotkeys.editorToolbarHotkeys.executeAll.keys, this.executeAll);
    Mousetrap.unbindGlobal(GlobalHotkeys.editorToolbarHotkeys.stopExecution.keys, this.stopExecution);

    Mousetrap.unbindGlobal(GlobalHotkeys.editorToolbarHotkeys.addEditor.keys, this.addEditor);
    Mousetrap.unbindGlobal(GlobalHotkeys.editorToolbarHotkeys.openFile.keys, this.openFile);
    Mousetrap.unbindGlobal(GlobalHotkeys.editorToolbarHotkeys.saveFile.keys, this.saveFile);
  }

  componentDidMount() {
    // Add hotkey bindings for this component:
    Mousetrap.bindGlobal(GlobalHotkeys.editorToolbarHotkeys.executeLine.keys, this.executeLine);
    Mousetrap.bindGlobal(GlobalHotkeys.editorToolbarHotkeys.executeAll.keys, this.executeAll);
    Mousetrap.bindGlobal(GlobalHotkeys.editorToolbarHotkeys.stopExecution.keys, this.stopExecution);

    Mousetrap.bindGlobal(GlobalHotkeys.editorToolbarHotkeys.addEditor.keys, this.addEditor);
    Mousetrap.bindGlobal(GlobalHotkeys.editorToolbarHotkeys.openFile.keys, this.openFile);
    Mousetrap.bindGlobal(GlobalHotkeys.editorToolbarHotkeys.saveFile.keys, this.saveFile);
  }

  reactionToNewEditorForTreeAction;
  reactionToNewEditorForProfileId;

  /**
   * called when there is new connection profile get created.
   *
   * @param profile the newly created connection profile
   */
  profileCreated(profile) {
    const {editors, editorToolbar, editorPanel} = this.props.store;
    let existingEditor = null;
    let profileHasEditor = false;
    editors.forEach((editor) => {
      if (profile.id == editor.profileId) {
        existingEditor = editor;
        profileHasEditor = true;
      }
    });
    if (!profileHasEditor) {
      const fileName = `new${profile.editorCount}.js`;
      const editorId = uuidV1();
      profile.editorCount += 1;
      editors.set(editorId, observable({
        // eslint-disable-line react/prop-types
        id: editorId,
        alias: profile.alias,
        profileId: profile.id,
        shellId: profile.shellId,
        currentProfile: profile.id,
        fileName,
        visible: true,
        executing: false,
        initialMsg: profile.initialMsg,
        code: '',
        status: profile.status,
        path: null,
        shellVersion: profile.shellVersion
      }));
      editorPanel.activeEditorId = editorId;
    } else {
      editorPanel.activeEditorId = existingEditor.id;
    }
    editorToolbar.noActiveProfile = false;
    editorToolbar.id = profile.id;
    editorToolbar.shellId = profile.shellId;
    editorToolbar.newConnectionLoading = false;
    editorPanel.activeDropdownId = profile.id;
    editorToolbar.currentProfile = profile.id;
    editorToolbar.noActiveProfile = false;
  }

  /**
   * Method for adding a new editor to an existing connection.
   *
   * @param {Object} options - options for creating new editor
   * @return {Promise}
   */
  @action addEditor(options = {}) {
    try {
      this.props.store.editorPanel.creatingNewEditor = true;
      this.setNewEditorLoading(true);
      const profileTitle = (this.props.store.editorToolbar.newEditorForTreeAction)
        ? this.props.store.profileList.selectedProfile.id
        : this.props.store.editorPanel.activeDropdownId;
      let profileId = 'UNKNOWN';
      this
        .props
        .store
        .profiles
        .forEach((value) => {
          if (value.id == profileTitle) {
            profileId = value.id;
          }
        });
      if (profileId == 'UNKNOWN') {
        if (this.props.store.userPreferences.telemetryEnabled) {
          EventLogging.recordManualEvent(EventLogging.getTypeEnum().EVENT.EDITOR_PANEL.NEW_EDITOR.FAILED_DEFAULT, EventLogging.getFragmentEnum().EDITORS, 'Cannot create new Editor for Default Tab.');
        }
        NewToaster.show({
          message: globalString('editor/toolbar/addEditorError'),
          intent: Intent.WARNING,
          iconName: 'pt-icon-thumbs-down'
        });
        this.onFail();
        this.setNewEditorLoading(false);
        return null;
      }
      return featherClient()
        .service('/mongo-shells')
        .create({id: profileId})
        .then((res) => {
          console.log('get response', res);
          return this.setNewEditorState(res, options);
        })
        .catch((err) => {
          if (this.props.store.userPreferences.telemetryEnabled) {
            EventLogging.recordManualEvent(EventLogging.getTypeEnum().ERROR, EventLogging.getFragmentEnum().EDITORS, err.message);
          }
          this.onFail();
          NewToaster.show({message: err.message, intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
          this.setNewEditorLoading(false);
        });
    } catch (err) {
      if (this.props.store.userPreferences.telemetryEnabled) {
        EventLogging.recordManualEvent(EventLogging.getTypeEnum().ERROR, EventLogging.getFragmentEnum().EDITORS, err.message);
      }
      NewToaster.show({message: err.message, intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
      this.onFail();
    }
  }

  /**
   * Action for setting if the new Editor is loading.
   * //TODO Note: This function exists only because of an issue with MobX strict mode in callbacks.
   * Guan has found a solution to this using runInAction (@Mike, Replace this some time.)
   * @param {Boolean} isLoading - Is the editor loading.
   */
  @action setNewEditorLoading(isLoading) {
    this.props.store.editorToolbar.newConnectionLoading = isLoading;
  }

  /**
   * Action for setting the new editor state.
   * Note: This function exists only because of an issue with MobX strict mode in callbacks.
   * Guan has found a solution to this using runInAction (@Mike, Replace this some time.)
   * @param {Object} res - The response recieved from Feathers.
   * @param {Object} options - options for new editor
   * @return {string} editor ID
   */
  @action setNewEditorState(res, options = {}) {
    const fileName = `new${this
      .props
      .store
      .profiles
      .get(res.id)
      .editorCount}.js`;
    const editorId = uuidV1();
    this
      .props
      .store
      .profiles
      .get(res.id)
      .editorCount += 1;
    this
      .props
      .store
      .editors
      .set(editorId, observable(_.assign({
        // eslint-disable-line react/prop-types
        id: editorId,
        alias: this
          .props
          .store
          .profiles
          .get(res.id)
          .alias,
        profileId: res.id,
        shellId: res.shellId,
        currentProfile: res.id,
        fileName,
        executing: false,
        visible: true,
        shellVersion: res.shellVersion,
        initialMsg: res.output
          ? res
            .output
            .join('\n')
          : '',
        code: '',
        status: ProfileStatus.OPEN,
        path: null
      }, options)));
    this.props.store.editorPanel.creatingNewEditor = false;
    this.props.store.editorToolbar.noActiveProfile = false;
    this.props.store.editorToolbar.id = res.id;
    this.props.store.editorToolbar.shellId = res.shellId;
    this.props.store.editorToolbar.newConnectionLoading = false;
    this.props.store.editorPanel.activeEditorId = editorId;
    this.props.store.editorToolbar.currentProfile = res.id;
    this.props.store.editorToolbar.noActiveProfile = false;
    this.props.store.editorPanel.activeDropdownId = res.id;
    NewToaster.show({
      message: globalString('editor/toolbar/connectionSuccess'),
      intent: Intent.SUCCESS,
      iconName: 'pt-icon-thumbs-up'
    });
    this.setNewEditorLoading(false);
    this.props.store.editorToolbar.isActiveExecuting = false;
    if (this.props.store.editorToolbar.newEditorForTreeAction) {
      this.props.store.editorToolbar.newEditorForTreeAction = false;
      this.props.store.treeActionPanel.treeActionEditorId = editorId;
      this.props.store.treeActionPanel.newEditorCreated = true;
      const treeEditor = this
        .props
        .store
        .editors
        .get(editorId);
      treeEditor.fileName = 'Tree Action';
      this
        .props
        .store
        .treeActionPanel
        .editors
        .set(editorId, treeEditor);
    }
    return editorId;
  }

  @action onFail() {
    this.props.store.editorPanel.creatingNewEditor = false;
  }

  _openFile = (path, cb) => {
    return featherClient()
      .service('files')
      .get(path)
      .then(res => cb(res))
      .catch((err) => {
        NewToaster.show({message: err.message, intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
        throw err;
      });
  };

  _watchFileBackgroundChange = (editorId) => {
    const editor = this
      .props
      .store
      .editors
      .get(editorId);
    if (editor && editor.path) {
      const handleFileChangedEvent = () => {
        this._openFile(editor.path, ({content}) => {
          runInAction(`Apply file background change for ${editorId}`, () => {
            editor.code = content;
          });
        });
      };
      const eventName = EventType.createFileChangedEvent(editor.path);
      Broker.on(eventName, handleFileChangedEvent);

      // smart recycle
      when(`Unwatch file changes for ${editorId}`, () => !this.props.store.editors.has(editorId), () => {
        Broker.off(eventName, handleFileChangedEvent);
      });
    }
  };

  openFile() {
    if (IS_ELECTRON) {
      dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
        properties: [
          'openFile', 'multiSelections'
        ],
        filters: FILE_FILTERS
      }, (fileNames) => {
        if (!fileNames) {
          return;
        }

        _.forEach(fileNames, (v) => {
          this._openFile(v, ({_id, content}) => {
            return this.addEditor({
              code: content,
              fileName: path.basename(_id),
              path: _id
            });
          })
            .then(this._watchFileBackgroundChange)
            .catch(() => {
            });
        });
      });
    } else {
      const warningMsg = globalString('editor/toolbar/notSupportedInUI', 'openFile');
      if (this.props.store.userPreferences.telemetryEnabled) {
        EventLogging.recordManualEvent(EventLogging.getTypeEnum().WARNING, EventLogging.getFragmentEnum().EDITORS, warningMsg);
      }
      NewToaster.show({message: warningMsg, intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
    }
  }

  saveFile() {
    if (IS_ELECTRON) {
      const currentEditor = this
        .props
        .store
        .editors
        .get(this.props.store.editorPanel.activeEditorId);
      if (!currentEditor) {
        return;
      }
      const _saveFile = (path) => {
        return featherClient()
          .service('files')
          .create({_id: path, content: currentEditor.code})
          .catch((err) => {
            NewToaster.show({message: err.message, intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
            throw err;
          });
      };
      if (currentEditor.path) {
        _saveFile(currentEditor.path);
      } else {
        dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
          filters: FILE_FILTERS
        }, (fileName) => {
          if (!fileName) {
            return;
          }
          _saveFile(fileName).then(() => {
            runInAction('update fileName and path', () => {
              currentEditor.fileName = path.basename(fileName);
              currentEditor.path = fileName;
              const treeEditor = this
                .props
                .store
                .treeActionPanel
                .editors
                .get(currentEditor.id);
              if (treeEditor) {
                this
                  .props
                  .store
                  .treeActionPanel
                  .editors
                  .delete(currentEditor.id);
              }
            });
            this._watchFileBackgroundChange(currentEditor.id);
          }).catch(() => {
          });
        });
      }
    } else {
      const warningMsg = globalString('editor/toolbar/notSupportedInUI', 'saveFile');
      if (this.props.store.userPreferences.telemetryEnabled) {
        EventLogging.recordManualEvent(EventLogging.getTypeEnum().WARNING, EventLogging.getFragmentEnum().EDITORS, warningMsg);
      }
      NewToaster.show({message: warningMsg, intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
    }
  }

  /**
   * Execute the line currently selected in the active CodeMirror instance.
   */
  @action executeLine() {
    if (this.props.store.editorPanel.activeEditorId == 'Default') {
      NewToaster.show({
        message: globalString('editor/toolbar/cannotExecuteOnWelcome'),
        intent: Intent.WARNING,
        iconName: 'pt-icon-thumbs-down'
      });
    } else {
      this.props.store.editorPanel.executingEditorLines = true;
    }
  }

  /**
   * Execute all the contents of the currently active CodeMirror instance.
   */
  @action executeAll() {
    if (this.props.store.editorPanel.activeEditorId == 'Default') {
      NewToaster.show({
        message: globalString('editor/toolbar/cannotExecuteOnWelcome'),
        intent: Intent.WARNING,
        iconName: 'pt-icon-thumbs-down'
      });
    } else {
      this.props.store.editorPanel.executingEditorAll = true;
    }
  }

  /**
   * NOT YET IMPLEMENTED: Open the Explain Plan dialog for the currently selected line in the active
   * codemirror instance.
   */
  explainPlan() {
    if (this.props.store.userPreferences.telemetryEnabled) {
      EventLogging.recordManualEvent(EventLogging.getTypeEnum().WARNING, EventLogging.getFragmentEnum().EDITORS, 'Tried to execute non-implemented explainPlan');
    }
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.WARNING, iconName: 'pt-icon-thumbs-down'});
  }

  /**
   * Stop the current execution on this connection.
   */
  @action.bound
  stopExecution() {
    if (this.props.store.editorToolbar.isActiveExecuting) {
      this.props.store.editorPanel.stoppingExecution = true;
    } else {
      NewToaster.show({
        message: 'Cannot stop execution. Nothing is executing.',
        intent: Intent.WARNING,
        iconName: 'pt-icon-thumbs-down'
      });
    }
  }

  /**
   * Event triggered when the dropdown changes.
   * @param {Object} event - The event that triggered this action.
   * @param {Object} event.target - The target of the event.
   * @param {String} event.target.value - The new value of the dropdown.
   */
  @action onDropdownChanged(event) {
    const prevDropdown = this.props.store.editorPanel.activeDropdownId;
    const newDropdown = event.target.value;
    this.props.store.editorPanel.activeDropdownId = newDropdown;
    this.props.store.editorToolbar.currentProfile = newDropdown;
    if (event.target.value == 'Default') {
      this.props.store.editorToolbar.noActiveProfile = true;
    } else {
      this.props.store.editorToolbar.noActiveProfile = false;
    }
    // Send command through current editor to swap DB: Get current editor instance:

    const editor = this
      .props
      .store
      .editors
      .get(this.props.store.editorPanel.activeEditorId);
    const profile = this
      .props
      .store
      .profiles
      .get(this.props.store.editorToolbar.currentProfile);
    if (profile) {
      // Send Command:
      const service = featherClient().service('/mongo-sync-execution');
      service.timeout = 5000;
      service
        .update(editor.profileId, {
          shellId: editor.shellId,
          newProfile: profile.id,
          swapProfile: true // eslint-disable-line
        })
        .then((res) => {
        console.log('swap connection response ', res);
          if (res.shellId) {
            // a new shell got created.
            runInAction('Update dropdown on success', () => {
              this.updateCurrentProfile(profile, res.shellId);
            });
            NewToaster.show({message: 'Swapped Profiles.', intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
          } else {
            const match = res.match(/Error/g);
            if (match) {
              console.log('Failed to swap profiles: ', res);
              runInAction('Revert dropdown change on failure', () => {
                this.props.store.editorPanel.activeDropdownId = prevDropdown;
                this.props.store.editorToolbar.currentProfile = prevDropdown;
              });
              NewToaster.show({
                message: globalString('editor/toolbar/profileSwapSslError'),
                intent: Intent.DANGER,
                iconName: 'pt-icon-thumbs-down'
              });
            } else {
              runInAction('Update dropdown on success', () => {
                this.updateCurrentProfile(profile);
              });
              NewToaster.show({message: 'Swapped Profiles.', intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
            }
          }
        })
        .catch((err) => {
          console.log('Failed to swap profiles: ', err);
          runInAction('Revert dropdown change on failure', () => {
            this.props.store.editorPanel.activeDropdownId = prevDropdown;
            this.props.store.editorToolbar.currentProfile = prevDropdown;
          });
          NewToaster.show({
            message: globalString('editor/toolbar/profileSwapError'),
            intent: Intent.DANGER,
            iconName: 'pt-icon-thumbs-down'
          });
          // @TODO - Handle failure.
        });
    }
  }

  @action updateCurrentProfile(profile, shellId = undefined) {
    const editor = this
      .props
      .store
      .editors
      .get(this.props.store.editorPanel.activeEditorId);
    if (shellId) {
      editor.shellId = shellId;
      Broker.emit(EventType.SWAP_SHELL_CONNECTION, {oldId: editor.profileId, oldShellId: editor.shellId, id: profile.id, shellId});
      editor.profileId = profile.id;
    }
    editor
      .currentProfile = profile.id;
    editor
      .alias = profile.alias;
  }

  /**
   * Event triggered when the dropdown changes.
   * @param {Object} event - The event that triggered this action.
   * @param {Object} event.target - The target of the event.
   * @param {String} event.target.value - The new value of the filter.
   */
  @action onFilterChanged(event) {
    const filter = event
      .target
      .value
      .replace(/ /g, '');
    this.props.store.editorPanel.tabFilter = filter;
    this
      .props
      .store
      .editors
      .forEach((value) => {
        if (value.alias.includes(filter)) {
          value.visible = true;
        } else {
          if (value.alias + ' (' + value.shellId + ')' == this.props.store.editorPanel.activeEditorId) {
            this.props.store.editorPanel.activeEditorId = 'Default';
          }
          value.visible = false;
        }
      });
  }

  /**
   * Render function for this component.
   */
  render() {
    const profiles = this
      .props
      .store
      .profiles
      .entries();
    return (
      <nav className="pt-navbar editorToolbar">
        <div className="pt-navbar-group pt-align-left leftEditorToolbar">
          <div className="pt-navbar-heading">Query Input</div>
          <div className="pt-button-group pt-intent-primary leftButtonGroup">
            <div className="pt-select pt-intent-primary editorContextDropdownWrapper">
              <select
                onChange={this.onDropdownChanged}
                value={this.props.store.editorPanel.activeDropdownId}
                className="pt-intent-primary editorContextDropdown">
                <option key="Default" value="Default">
                  No Active Connection
                </option>
                ; {' '}
                {profiles.map((profile) => {
                  if (profile[1].status == 'OPEN') {
                    return (
                      <option key={profile[0]} value={profile[1].id}>
                        {profile[1].alias}
                      </option>
                    ); // eslint-disable-line react/no-array-index-key
                  }
                })}
              </select>
            </div>
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content={globalString('editor/toolbar/executeSelectedTooltip')}
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-intent-primary executeLineButton"
                onClick={this.executeLine}
                loading={this.props.store.editorToolbar.isActiveExecuting}
                disabled={this.props.store.editorToolbar.noActiveProfile}>
                <ExecuteLineIcon className="dbKodaSVG" width={20} height={20} />
              </AnchorButton>
            </Tooltip>
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content={globalString('editor/toolbar/executeAllTooltip')}
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-intent-primary executeAllButton"
                onClick={this.executeAll}
                loading={this.props.store.editorToolbar.isActiveExecuting}
                disabled={this.props.store.editorToolbar.noActiveProfile}>
                <ExecuteAllIcon className="dbKodaSVG" width={20} height={20} />
              </AnchorButton>
            </Tooltip>
            <ExplainPopover editorToolbar={this.props.store.editorToolbar} />
            <Tooltip
              intent={Intent.DANGER}
              hoverOpenDelay={1000}
              content={globalString('editor/toolbar/stopExecutionTooltip')}
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-intent-danger stopExecutionButton"
                loading={this.props.store.editorPanel.stoppingExecution}
                onClick={this.stopExecution}
                disabled={!this.props.store.editorToolbar.isActiveExecuting}>
                <StopExecutionIcon className="dbKodaSVG" width={20} height={20} />
              </AnchorButton>
            </Tooltip>
          </div>
        </div>
        <div className="pt-navbar-group pt-align-right">
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            content={globalString('editor/toolbar/addEditorTooltip')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}>
            <AnchorButton
              className="pt-button circleButton addEditorButton"
              loading={this.props.store.editorToolbar.newConnectionLoading}
              disabled={this.props.store.editorToolbar.noActiveProfile}
              onClick={this.addEditor}>
              <AddIcon className="dbKodaSVG" width={20} height={20} />
            </AnchorButton>
          </Tooltip>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            content={globalString('editor/toolbar/openFileTooltip')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}>
            <AnchorButton
              className="pt-button circleButton openFileButton"
              onClick={this.openFile}
              disabled={this.props.store.editorToolbar.noActiveProfile}>
              <OpenFileIcon className="dbKodaSVG" width={20} height={20} />
            </AnchorButton>
          </Tooltip>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            content={globalString('editor/toolbar/saveFileTooltip')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}>
            <AnchorButton
              className="pt-button circleButton saveFileButton"
              onClick={this.saveFile}
              disabled={this.props.store.editorToolbar.noActiveProfile}>
              <SaveFileIcon className="dbKodaSVG" width={20} height={20} />
            </AnchorButton>
          </Tooltip>
          {/* <Tooltip
           intent={Intent.NONE}
           hoverOpenDelay={1000}
           content="Enter a string to search for Editors"
           tooltipClassName="pt-dark"
           position={Position.BOTTOM}>
           <div className="pt-input-group .modifier">
           <span className="pt-icon pt-icon-search" />
           <input
           className="pt-input secondaryInput"
           type="search"
           placeholder="Filter Tabs..."
           dir="auto"
           onChange={this.onFilterChanged} />
           </div>
           </Tooltip> */}

        </div>
      </nav>
    );
  }
}
