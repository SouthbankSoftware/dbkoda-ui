/**
 * @Author: Michael Harrison <mike>
 * @Date:   2017-03-14 15:54:01
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-18T10:41:41+10:00
 */

/* eslint-disable react/prop-types */
/* eslint-disable react/sort-comp */
import _ from 'lodash';
import React from 'react';
import {featherClient} from '~/helpers/feathers';
import {observer, inject} from 'mobx-react';
import {action, reaction, observable, runInAction, when} from 'mobx';
import uuidV1 from 'uuid';
import path from 'path';
import {
  AnchorButton,
  Intent,
  Position,
  Tooltip,
  Hotkey,
  Hotkeys,
  HotkeysTarget
} from '@blueprintjs/core';
import {NewToaster} from '#/common/Toaster';
import EventLogging from '#/common/logging/EventLogging';
import './Panel.scss';
import {Broker, EventType} from '../../helpers/broker';
import ExplainPopover from './ExplainPopover';

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
@HotkeysTarget
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
    this.onFilterChanged = this
      .onFilterChanged
      .bind(this);
    this.renderHotkeys = this
      .onFilterChanged
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

    // reaction to add a new editor when a new tree action open a new form. This
    // will create a new editor.
    this.reactionToNewEditorForTreeAction = reaction(() => this.props.store.editorToolbar.newEditorForTreeAction, () => {
      if (this.props.store.editorToolbar.newEditorForTreeAction) {
        this.addEditor({});
      }
    });
  }

  componentWillUnmount() {
    this.reactionToNewEditorForTreeAction();
  }

  reactionToNewEditorForTreeAction;

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
      if (profile.shellId == editor.shellId) {
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
        path: null
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
        NewToaster.show({message: 'Cannot create new Editor for "No Active Connection".', intent: Intent.WARNING, iconName: 'pt-icon-thumbs-down'});
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
        initialMsg: res.output
          ? res
            .output
            .join('\n')
          : '',
        code: '',
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
    NewToaster.show({message: 'Connection Success!', intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
    this.setNewEditorLoading(false);
    this.props.store.editorToolbar.isActiveExecuting = false;
    if (this.props.store.editorToolbar.newEditorForTreeAction) {
      this.props.store.editorToolbar.newEditorForTreeAction = false;
      this.props.store.treeActionPanel.treeActionEditorId = editorId;
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
            .catch(() => {});
        });
      });
    } else {
      const warningMsg = '`openFile` is not supported in browser UI';
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
            });
            this._watchFileBackgroundChange(currentEditor.id);
          }).catch(() => {});
        });
      }
    } else {
      const warningMsg = '`saveFile` is not supported in browser UI';
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
      NewToaster.show({message: 'Cannot Execute on Welcome Page.', intent: Intent.WARNING, iconName: 'pt-icon-thumbs-down'});
    } else {
      this.props.store.editorPanel.executingEditorLines = true;
    }
  }

  /**
   * Execute all the contents of the currently active CodeMirror instance.
   */
  @action executeAll() {
    if (this.props.store.editorPanel.activeEditorId == 'Default') {
      NewToaster.show({message: 'Cannot Execute on Welcome Page.', intent: Intent.WARNING, iconName: 'pt-icon-thumbs-down'});
    } else {
      this.props.store.editorPanel.executingEditorAll = true;
    }
  }

  /**
   * NOT YET IMPLEMENTED: Open the Explain Plan dialog for the currently selected line in the active
   * codemirror instance.
   */
  explainPlan() {
    // eslint-disable-line class-methods-use-this
    if (this.props.store.userPreferences.telemetryEnabled) {
      EventLogging.recordManualEvent(EventLogging.getTypeEnum().WARNING, EventLogging.getFragmentEnum().EDITORS, 'Tried to execute non-implemented explainPlan');
    }
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.WARNING, iconName: 'pt-icon-thumbs-down'});
  }

  /**
   * NOT YET IMPLEMENTED: Stop the current execution on this connection.
   */
  @action.bound
  stopExecution() {
    // eslint-disable-line class-methods-use-this
    this.props.store.editorPanel.stoppingExecution = true;
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
      service.timeout = 1000;
      service
        .update(editor.profileId, {
        shellId: editor.shellId,
        newProfile: profile.id,
        swapProfile: true // eslint-disable-line
      })
        .then((res) => {
          const match = res.match(/Error/g);
          if (match) {
            console.log('Failed to swap profiles: ', res);
            runInAction('Revert dropdown change on failure', () => {
              this.props.store.editorPanel.activeDropdownId = prevDropdown;
              this.props.store.editorToolbar.currentProfile = prevDropdown;
            });
            NewToaster.show({message: 'Could not swap profiles due to SSL differences.', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
          } else {
            runInAction('Update dropdown on success', () => {
              this.updateCurrentProfile(profile);
            });
            NewToaster.show({message: 'Swapped Profiles.', intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
          }
        })
        .catch((err) => {
          console.log('Failed to swap profiles: ', err);
          runInAction('Revert dropdown change on failure', () => {
            this.props.store.editorPanel.activeDropdownId = prevDropdown;
            this.props.store.editorToolbar.currentProfile = prevDropdown;
          });
          NewToaster.show({message: 'Could not swap Profiles.', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
          // @TODO - Handle failure.
        });
    }
  }

  @action updateCurrentProfile(profile) {
    this
      .props
      .store
      .editors
      .get(this.props.store.editorPanel.activeEditorId)
      .currentProfile = profile.id;
    this
      .props
      .store
      .editors
      .get(this.props.store.editorPanel.activeEditorId)
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
              content="Execute Selected Commands"
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-icon-chevron-right pt-intent-primary executeLineButton"
                onClick={this.executeLine}
                loading={this.props.store.editorToolbar.isActiveExecuting}
                disabled={this.props.store.editorToolbar.noActiveProfile} />
            </Tooltip>
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content="Execute All Commands"
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-icon-double-chevron-right pt-intent-primary executeAllButton"
                onClick={this.executeAll}
                loading={this.props.store.editorToolbar.isActiveExecuting}
                disabled={this.props.store.editorToolbar.noActiveProfile} />
            </Tooltip>
            <ExplainPopover editorToolbar={this.props.store.editorToolbar} />
            <Tooltip
              intent={Intent.DANGER}
              hoverOpenDelay={1000}
              content="Stop Execution"
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-icon-stop pt-intent-danger stopExecutionButton"
                loading={this.props.store.editorPanel.stoppingExecution}
                onClick={this.stopExecution}
                disabled={!this.props.store.editorToolbar.isActiveExecuting} />
            </Tooltip>
          </div>
        </div>
        <div className="pt-navbar-group pt-align-right">
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            content="Add a new Editor"
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}>
            <AnchorButton
              className="pt-button pt-icon-add circleButton addEditorButton"
              loading={this.props.store.editorToolbar.newConnectionLoading}
              disabled={this.props.store.editorToolbar.noActiveProfile}
              onClick={this.addEditor} />
          </Tooltip>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            content="Open a File from Disc"
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}>
            <AnchorButton
              className="pt-button pt-icon-document-open circleButton openFileButton"
              onClick={this.openFile}
              disabled={this.props.store.editorToolbar.noActiveProfile} />
          </Tooltip>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            content="Save Editor Contents to Disc"
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}>
            <AnchorButton
              className="pt-button pt-icon-floppy-disk circleButton saveFileButton"
              onClick={this.saveFile}
              disabled={this.props.store.editorToolbar.noActiveProfile} />
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

  /**
   * Render function for the hotkeys associated with this component.
   */
  renderHotkeys() {
    return (
      <Hotkeys>
        <Hotkey global combo="shift + n" label="New Editor" onKeyDown={this.addEditor} />
        <Hotkey
          global
          combo="shift + a"
          label="Execute All"
          onKeyDown={this.executeAll} />
        <Hotkey
          global
          combo="shift + e"
          label="Execute Selected"
          onKeyDown={this.executeLine} />
        <Hotkey
          global
          combo="shift + s"
          label="Stop Execution"
          onKeyDown={this.stopExecution} />
      </Hotkeys>
    );
  }
}
