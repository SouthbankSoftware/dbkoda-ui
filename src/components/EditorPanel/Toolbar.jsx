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
 *
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-21T09:27:03+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2017-10-30T15:55:58+11:00
 */

import _ from 'lodash';
import React from 'react';
import Mousetrap from 'mousetrap';
import 'mousetrap-global-bind';
import { featherClient } from '~/helpers/feathers';
import { inject, observer } from 'mobx-react';
import { action, reaction, runInAction } from 'mobx';
import path from 'path';
import { AnchorButton, Intent, Position, Tooltip } from '@blueprintjs/core';
import { NewToaster } from '#/common/Toaster';
import EventLogging from '#/common/logging/EventLogging';
import { GlobalHotkeys } from '#/common/hotkeys/hotkeyList.jsx';
import './Panel.scss';
import { Broker, EventType } from '../../helpers/broker';
import ExplainPopover from './ExplainPopover';
import StopExecutionIcon from '../../styles/icons/stop-execute-icon.svg';
import AddIcon from '../../styles/icons/add-icon.svg';
import OpenFileIcon from '../../styles/icons/open-icon.svg';
import SaveFileIcon from '../../styles/icons/save-icon.svg';

const { dialog, BrowserWindow } = IS_ELECTRON
  ? window.require('electron').remote
  : {};

const FILE_FILTERS = [
  {
    name: 'JavaScript',
    extensions: ['js'],
  },
];

/**
 * Defines the Toolbar for the Tabbed Editor Panel.
 */
@inject(allStores => ({
  store: allStores.store,
  api: allStores.api,
}))
@observer
export default class Toolbar extends React.Component {
  constructor(props) {
    super(props);

    // this.addEditorNoOptions = this.addEditor.bind(this);
    this.executeLine = this.executeLine.bind(this);
    this.executeAll = this.executeAll.bind(this);
    this.explainPlan = this.explainPlan.bind(this);
    this.onDropdownChanged = this.onDropdownChanged.bind(this);
    this.openFile = this.openFile.bind(this);
    this.saveFile = this.saveFile.bind(this);
    this.saveFileHandleError = () =>
      this.saveFile().catch((e) => {
        if (e) {
          console.error(e);
        }
      });
    this.saveFileAs = this.saveFileAs.bind(this);

    Broker.on(EventType.NEW_PROFILE_CREATED, (profile) => {
      this.props.api.profileCreated(profile);
    });
    Broker.on(EventType.RECONNECT_PROFILE_CREATED, (profile) => {
      this.props.api.profileCreated(profile);
    });

    this.reactionToNewEditorForProfileId = reaction(
      () => this.props.store.editorToolbar.newEditorForProfileId,
      () => {
        if (this.props.store.editorToolbar.newEditorForProfileId != '') {
          this.props.store.editorPanel.activeDropdownId = this.props.store.editorToolbar.newEditorForProfileId;
          this.props.api.addEditor();
          this.props.store.editorToolbar.newEditorForProfileId = '';
        }
      },
    );
  }

  handleMainProcessCommand = (event, message) => {
    if (message === 'openFile') {
      this.openFile();
    } else if (message === 'saveFile') {
      this.saveFileHandleError();
    } else if (message === 'saveFileAs') {
      this.saveFileAs();
    } else if (message === 'newEditor') {
      this.props.api.addEditor();
    } else if (message === 'openPreferences') {
      this.props.api.openConfigTab();
    }
  };

  componentDidMount() {
    // Add hotkey bindings for this component:
    Mousetrap.bindGlobal(
      GlobalHotkeys.editorToolbarHotkeys.executeLine.keys,
      this.executeLine,
    );
    Mousetrap.bindGlobal(
      GlobalHotkeys.editorToolbarHotkeys.executeAll.keys,
      this.executeAll,
    );
    Mousetrap.bindGlobal(
      GlobalHotkeys.editorToolbarHotkeys.stopExecution.keys,
      this.stopExecution,
    );

    if (IS_ELECTRON) {
      window
        .require('electron')
        .ipcRenderer.on('command', this.handleMainProcessCommand);
    }
  }

  componentWillUnmount() {
    this.reactionToNewEditorForProfileId();
    Mousetrap.unbindGlobal(
      GlobalHotkeys.editorToolbarHotkeys.executeLine.keys,
      this.executeLine,
    );
    Mousetrap.unbindGlobal(
      GlobalHotkeys.editorToolbarHotkeys.executeAll.keys,
      this.executeAll,
    );
    Mousetrap.unbindGlobal(
      GlobalHotkeys.editorToolbarHotkeys.stopExecution.keys,
      this.stopExecution,
    );

    if (IS_ELECTRON) {
      window
        .require('electron')
        .ipcRenderer.removeListener('command', this.handleMainProcessCommand);
    }
  }

  reactionToNewEditorForProfileId;

  @action
  onFail() {
    this.props.store.editorPanel.creatingNewEditor = false;
  }

  openFile() {
    if (IS_ELECTRON) {
      dialog.showOpenDialog(
        BrowserWindow.getFocusedWindow(),
        {
          properties: ['openFile', 'multiSelections'],
          filters: FILE_FILTERS,
        },
        (fileNames) => {
          if (!fileNames) {
            return;
          }

          _.forEach(fileNames, (v) => {
            this.props.store
              .openFile(v, ({ _id, content }) => {
                let _fileName = path.basename(_id);
                if (window.navigator.platform.toLowerCase() === 'win32') {
                  _fileName = _id.substring(
                    _id.lastIndexOf('\\') + 1,
                    _id.length,
                  );
                }
                return this.props.api.addEditor({
                  content,
                  fileName: _fileName,
                  path: _id,
                });
              })
              .catch(() => {});
          });
        },
      );
    } else {
      const warningMsg = globalString(
        'editor/toolbar/notSupportedInUI',
        'openFile',
      );
      if (this.props.config.settings.telemetryEnabled) {
        EventLogging.recordManualEvent(
          EventLogging.getTypeEnum().WARNING,
          EventLogging.getFragmentEnum().EDITORS,
          warningMsg,
        );
      }
      NewToaster.show({
        message: warningMsg,
        className: 'danger',
        iconName: 'pt-icon-thumbs-down',
      });
    }
  }

  saveFileAs() {
    this.props.store.editorToolbar.saveAs = true;
    this.saveFile().catch((e) => {
      if (e) {
        console.error(e);
      }
    });
  }

  saveFile(currentEditor) {
    if (IS_ELECTRON) {
      currentEditor =
        currentEditor ||
        this.props.store.editors.get(
          this.props.store.editorPanel.activeEditorId,
        );

      if (!currentEditor) {
        return Promise.reject();
      }

      const _saveFile = (path) => {
        return featherClient()
          .service('files')
          .create({ _id: path, content: currentEditor.doc.getValue() })
          .then(() => currentEditor.doc.markClean())
          .catch((err) => {
            NewToaster.show({
              message: err.message,
              className: 'danger',
              iconName: 'pt-icon-thumbs-down',
            });
            throw err;
          });
      };

      if (currentEditor.path && !this.props.store.editorToolbar.saveAs) {
        return _saveFile(currentEditor.path);
      }

      const { api: { getUnsavedEditorSuggestedFileName } } = this.props;

      return new Promise((resolve, reject) => {
        dialog.showSaveDialog(
          BrowserWindow.getFocusedWindow(),
          {
            defaultPath: path.resolve(
              this.props.store.editorPanel.lastFileSavingDirectoryPath,
              getUnsavedEditorSuggestedFileName(currentEditor),
            ),
            filters: FILE_FILTERS,
          },
          (fileName) => {
            this.props.store.editorToolbar.saveAs = false;
            if (!fileName) {
              return reject();
            }
            this.props.store.editorPanel.lastFileSavingDirectoryPath = path.dirname(
              fileName,
            );
            _saveFile(fileName)
              .then(() => {
                runInAction('update fileName and path', () => {
                  currentEditor.fileName = path.basename(fileName);
                  if (window.navigator.platform.toLowerCase() === 'win32') {
                    currentEditor.fileName = fileName.substring(
                      fileName.lastIndexOf('\\') + 1,
                      fileName.length,
                    );
                  }
                  currentEditor.path = fileName;
                  const treeEditor = this.props.store.treeActionPanel.editors.get(
                    currentEditor.id,
                  );
                  if (treeEditor) {
                    this.props.store.treeActionPanel.editors.delete(
                      currentEditor.id,
                    );
                  }
                });
                this.props.store.watchFileBackgroundChange(currentEditor.id);
                resolve();
              })
              .catch(reject);
          },
        );
      });
    }

    const warningMsg = globalString(
      'editor/toolbar/notSupportedInUI',
      'saveFile',
    );
    if (this.props.config.settings.telemetryEnabled) {
      EventLogging.recordManualEvent(
        EventLogging.getTypeEnum().WARNING,
        EventLogging.getFragmentEnum().EDITORS,
        warningMsg,
      );
    }
    NewToaster.show({
      message: warningMsg,
      className: 'danger',
      iconName: 'pt-icon-thumbs-down',
    });

    return Promise.reject(new Error(warningMsg));
  }

  /**
   * Execute the line currently selected in the active CodeMirror instance.
   */
  @action
  executeLine() {
    if (this.props.store.editorPanel.activeEditorId == 'Default') {
      NewToaster.show({
        message: globalString('editor/toolbar/cannotExecuteOnWelcome'),
        className: 'warning',
        iconName: 'pt-icon-thumbs-down',
      });
    } else {
      this.props.store.editorPanel.executingEditorLines = true;
    }
  }

  /**
   * Execute all the contents of the currently active CodeMirror instance.
   */
  @action
  executeAll() {
    if (this.props.store.editorPanel.activeEditorId == 'Default') {
      NewToaster.show({
        message: globalString('editor/toolbar/cannotExecuteOnWelcome'),
        className: 'warning',
        iconName: 'pt-icon-thumbs-down',
      });
    } else {
      this.props.store.editorPanel.executingEditorAll = true;
    }
  }

  /**
   * Open the Explain Plan dialog for the currently selected line in the active
   * codemirror instance.
   */
  explainPlan() {
    if (this.props.config.settings.telemetryEnabled) {
      EventLogging.recordManualEvent(
        EventLogging.getTypeEnum().WARNING,
        EventLogging.getFragmentEnum().EDITORS,
        'Tried to execute non-implemented explainPlan',
      );
    }
    NewToaster.show({
      message: 'Sorry, not yet implemented!',
      className: 'warning',
      iconName: 'pt-icon-thumbs-down',
    });
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
        className: 'warning',
        iconName: 'pt-icon-thumbs-down',
      });
    }
  }

  /**
   * Event triggered when the dropdown changes.
   * @param {Object} event - The event that triggered this action.
   * @param {Object} event.target - The target of the event.
   * @param {String} event.target.value - The new value of the dropdown.
   */
  @action
  onDropdownChanged(event) {
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

    const editor = this.props.store.editors.get(
      this.props.store.editorPanel.activeEditorId,
    );
    const profile = this.props.store.profiles.get(
      this.props.store.editorToolbar.currentProfile,
    );
    if (profile) {
      // Send Command:
      Broker.emit(EventType.FEATURE_USE, 'ContextDropdown');
      const service = featherClient().service('/mongo-sync-execution');
      service.timeout = 5000;
      service
        .update(editor.profileId, {
          shellId: editor.shellId,
          newProfile: profile.id,
          swapProfile: true,
        })
        .then((res) => {
          if (res.shellId) {
            // a new shell got created.
            runInAction('Update dropdown on success', () => {
              this.updateCurrentProfile(profile, res.shellId);
            });
            NewToaster.show({
              message: 'Swapped Profiles.',
              className: 'success',
              iconName: 'pt-icon-thumbs-up',
            });
          } else {
            const match = res.match(/Error/g);
            if (match) {
              runInAction('Revert dropdown change on failure', () => {
                this.props.store.editorPanel.activeDropdownId = prevDropdown;
                this.props.store.editorToolbar.currentProfile = prevDropdown;
              });
              NewToaster.show({
                message: globalString('editor/toolbar/profileSwapSslError'),
                className: 'danger',
                iconName: 'pt-icon-thumbs-down',
              });
            } else {
              runInAction('Update dropdown on success', () => {
                this.updateCurrentProfile(profile);
              });
              NewToaster.show({
                message: 'Swapped Profiles.',
                className: 'success',
                iconName: 'pt-icon-thumbs-up',
              });
            }
          }
        })
        .catch((err) => {
          console.error(err);
          runInAction('Revert dropdown change on failure', () => {
            this.props.store.editorPanel.activeDropdownId = prevDropdown;
            this.props.store.editorToolbar.currentProfile = prevDropdown;
          });
          NewToaster.show({
            message: globalString('editor/toolbar/profileSwapError'),
            className: 'danger',
            iconName: 'pt-icon-thumbs-down',
          });
        });
    }
  }

  @action
  updateCurrentProfile(profile, shellId = undefined) {
    const editor = this.props.store.editors.get(
      this.props.store.editorPanel.activeEditorId,
    );
    if (shellId) {
      Broker.emit(EventType.SWAP_SHELL_CONNECTION, {
        oldId: editor.profileId,
        oldShellId: editor.shellId,
        id: profile.id,
        shellId,
      });
      editor.shellId = shellId;
      editor.profileId = profile.id;
    }
    editor.currentProfile = profile.id;
    editor.alias = profile.alias;
  }

  /**
   * Event triggered when the dropdown changes.
   * @param {Object} event - The event that triggered this action.
   * @param {Object} event.target - The target of the event.
   * @param {String} event.target.value - The new value of the filter.
   */
  @action
  onFilterChanged(event) {
    const filter = event.target.value.replace(/ /g, '');
    this.props.store.editorPanel.tabFilter = filter;
    this.props.store.editors.forEach((value) => {
      if (value.alias.includes(filter)) {
        value.visible = true;
      } else {
        if (
          value.alias + ' (' + value.shellId + ')' ==
          this.props.store.editorPanel.activeEditorId
        ) {
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
    const profiles = this.props.store.profiles.entries();
    return (
      <nav className="pt-navbar editorToolbar">
        <div className="pt-navbar-group pt-align-left leftEditorToolbar">
          <div className="pt-navbar-heading">Query Input</div>
          <div className="pt-button-group pt-intent-primary leftButtonGroup">
            <div className="pt-select pt-intent-primary editorContextDropdownWrapper">
              <select
                onChange={this.onDropdownChanged}
                value={this.props.store.editorPanel.activeDropdownId}
                className="pt-intent-primary editorContextDropdown"
              >
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
              position={Position.BOTTOM}
            >
              <AnchorButton
                className="pt-button pt-intent-primary executeLineButton pt-icon-chevron-right"
                onClick={this.executeLine}
                loading={this.props.store.editorToolbar.isActiveExecuting}
                disabled={this.props.store.editorToolbar.noActiveProfile}
              >
                {/* // <ExecuteLineIcon className="dbKodaSVG" width={20} height={20} /> */}
              </AnchorButton>
            </Tooltip>
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content={globalString('editor/toolbar/executeAllTooltip')}
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}
            >
              <AnchorButton
                className="pt-button pt-intent-primary executeAllButton pt-icon-double-chevron-right"
                onClick={this.executeAll}
                loading={this.props.store.editorToolbar.isActiveExecuting}
                disabled={this.props.store.editorToolbar.noActiveProfile}
              >
                {/* <ExecuteAllIcon className="dbKodaSVG" width={20} height={20} /> */}
              </AnchorButton>
            </Tooltip>
            <ExplainPopover editorToolbar={this.props.store.editorToolbar} />
            <Tooltip
              intent={Intent.DANGER}
              hoverOpenDelay={1000}
              content={globalString('editor/toolbar/stopExecutionTooltip')}
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}
            >
              <AnchorButton
                className="pt-button pt-intent-danger stopExecutionButton"
                loading={this.props.store.editorPanel.stoppingExecution}
                onClick={this.stopExecution}
                disabled={!this.props.store.editorToolbar.isActiveExecuting}
              >
                <StopExecutionIcon
                  className="dbKodaSVG"
                  width={20}
                  height={20}
                />
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
            position={Position.BOTTOM}
          >
            <AnchorButton
              className="pt-button circleButton addEditorButton"
              loading={this.props.store.editorToolbar.newConnectionLoading}
              disabled={this.props.store.editorToolbar.noActiveProfile}
              onClick={this.props.api.addEditor}
            >
              <AddIcon className="dbKodaSVG" width={20} height={20} />
            </AnchorButton>
          </Tooltip>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            content={globalString('editor/toolbar/openFileTooltip')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}
          >
            <AnchorButton
              className="pt-button circleButton openFileButton"
              onClick={this.openFile}
              disabled={this.props.store.editorToolbar.noActiveProfile}
            >
              <OpenFileIcon className="dbKodaSVG" width={20} height={20} />
            </AnchorButton>
          </Tooltip>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            content={globalString('editor/toolbar/saveFileTooltip')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM_RIGHT}
          >
            <AnchorButton
              className="pt-button circleButton saveFileButton"
              onClick={this.saveFileHandleError}
              disabled={
                this.props.store.editorPanel.activeEditorId === 'Default'
              }
            >
              <SaveFileIcon className="dbKodaSVG" width={20} height={20} />
            </AnchorButton>
          </Tooltip>
        </div>
      </nav>
    );
  }
}
