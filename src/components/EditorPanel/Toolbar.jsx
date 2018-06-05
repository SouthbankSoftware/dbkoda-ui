/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-21T09:27:03+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-05-29T10:28:57+10:00
 *
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

import _ from 'lodash';
import React from 'react';
import Mousetrap from 'mousetrap';
import 'mousetrap-global-bind';
import { featherClient } from '~/helpers/feathers';
import { performancePanelStatuses } from '~/api/PerformancePanel';
import { inject, observer } from 'mobx-react';
import { action, reaction, runInAction } from 'mobx';
import autobind from 'autobind-decorator';
import path from 'path';
import { AnchorButton, Intent, Position, Tooltip, Dialog } from '@blueprintjs/core';
import { NewToaster } from '#/common/Toaster';
import { GlobalHotkeys } from '#/common/hotkeys/hotkeyList.jsx';
import { EditorTypes } from '#/common/Constants.js';
import './Panel.scss';
import QuickTreeActionDialogue from './Dialogues/QuickTreeActionDialogue.jsx';
import { Broker, EventType } from '../../helpers/broker';

// Icon Imports.
import ExplainPopover from './ExplainPopover';
import StopExecutionIcon from '../../styles/icons/stop-execute-icon.svg';
import AddIcon from '../../styles/icons/add-icon.svg';
import OpenFileIcon from '../../styles/icons/open-icon.svg';
import SaveFileIcon from '../../styles/icons/save-icon.svg';
import PerfPanelIcon from '../../styles/icons/performance-icon-bold.svg';
import SearchIcon from '../../styles/icons/enhanced-json-icon.svg';
import AggregateIcon from '../../styles/icons/aggregate-builder-icon.svg';
import ChartIcon from '../../styles/icons/storage-icon-bold.svg';

const { dialog, BrowserWindow } = IS_ELECTRON ? window.require('electron').remote : {};

/**
 * @Mike TODO -> These filters can probably be moved to a common place in the constants file.
 */
const FILE_FILTERS = [
  {
    name: 'JavaScript',
    extensions: ['js']
  }
];

const FILE_FILTERS_SQL = [
  {
    name: 'SQL',
    extensions: ['sql']
  }
];

/**
 * Defines the Toolbar for the Tabbed Editor Panel.
 */
@inject(allStores => ({
  store: allStores.store,
  api: allStores.api,
  profileStore: allStores.profileStore
}))
@observer
export default class Toolbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showLoadSQLWarning: false,
      isSimpleQueryDialogueOpen: false,
      isAggregateQueryDialogueOpen: false,
      isStorageDrilldownDialogueOpen: false
    };
    /**
     * @Mike TODO -> These can probably all be moved to using @action.bound instead of binding up the top, since it's a lot neater.
     */
    // this.addEditorNoOptions = this.addEditor.bind(this);
    this.executeLine = this.executeLine.bind(this);
    this.executeAll = this.executeAll.bind(this);
    this.onDropdownChanged = this.onDropdownChanged.bind(this);
    this.openFile = this.openFile.bind(this);
    this.openSQLFile = this.openSQLFile.bind(this);
    this.saveFile = this.saveFile.bind(this);
    this.renderSQLImportWarning = this.renderSQLImportWarning.bind(this);
    this.saveFileHandleError = () =>
      this.saveFile().catch(e => {
        if (e) {
          l.error(e);
        }
      });
    this.saveFileAs = this.saveFileAs.bind(this);

    Broker.on(EventType.NEW_PROFILE_CREATED, profile => {
      this.props.api.profileCreated(profile);
    });
    Broker.on(EventType.RECONNECT_PROFILE_CREATED, profile => {
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
      }
    );

    /**
     * Reaction to track execution time.
     * @TODO - Would be better if we could track each query independantly, this method will only cover how long the editor thinks it's executing.
     */
    this.reactionToExecutionState = reaction(
      () => this.props.store.editorToolbar.newEditorForProfileId,
      () => {
        if (this.props.store.editorToolbar.newEditorForProfileId != '') {
          this.props.store.editorPanel.activeDropdownId = this.props.store.editorToolbar.newEditorForProfileId;
          this.props.api.addEditor();
          this.props.store.editorToolbar.newEditorForProfileId = '';
        }
      }
    );
    this.reactionToPerformancePanel = reaction(
      () => this.props.store.editorToolbar.reloadToolbar,
      () => {
        if (this.props.store.editorToolbar.reloadToolbar) {
          this.props.store.editorToolbar.reloadToolbar = false;
          setTimeout(() => {
            this.forceUpdate();
          }, 100);
        }
      }
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
      this.props.api.openHomeTab();
    }
  };

  componentDidMount() {
    // Add hotkey bindings for this component:
    Mousetrap.bindGlobal(GlobalHotkeys.editorToolbarHotkeys.executeLine.keys, this.executeLine);
    Mousetrap.bindGlobal(GlobalHotkeys.editorToolbarHotkeys.executeAll.keys, this.executeAll);
    Mousetrap.bindGlobal(GlobalHotkeys.editorToolbarHotkeys.stopExecution.keys, this.stopExecution);

    if (IS_ELECTRON) {
      window.require('electron').ipcRenderer.on('command', this.handleMainProcessCommand);
    }
  }

  componentWillUnmount() {
    this.reactionToNewEditorForProfileId();
    Mousetrap.unbindGlobal(GlobalHotkeys.editorToolbarHotkeys.executeLine.keys, this.executeLine);
    Mousetrap.unbindGlobal(GlobalHotkeys.editorToolbarHotkeys.executeAll.keys, this.executeAll);
    Mousetrap.unbindGlobal(
      GlobalHotkeys.editorToolbarHotkeys.stopExecution.keys,
      this.stopExecution
    );

    if (IS_ELECTRON) {
      window
        .require('electron')
        .ipcRenderer.removeListener('command', this.handleMainProcessCommand);
    }
  }

  reactionToNewEditorForProfileId;

  /**
   * @Mike TODO -> This can probably be an inline function, since it's a single line.
   */
  @action
  onFail() {
    this.props.store.editorPanel.creatingNewEditor = false;
  }

  openFile() {
    if (IS_ELECTRON) {
      const editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);

      if (editor && editor.type === 'drill') {
        // Show Warning.
        this.setState({ showLoadSQLWarning: true });
      } else {
        // Else
        dialog.showOpenDialog(
          BrowserWindow.getFocusedWindow(),
          {
            properties: ['openFile', 'multiSelections'],
            filters: FILE_FILTERS
          },
          fileNames => {
            if (!fileNames) {
              return;
            }

            _.forEach(fileNames, v => {
              this.props.store
                .openFile(v, ({ _id, content }) => {
                  let _fileName = path.basename(_id);
                  if (window.navigator.platform.toLowerCase() === 'win32') {
                    _fileName = _id.substring(_id.lastIndexOf('\\') + 1, _id.length);
                  }
                  return this.props.api.addEditor({
                    content,
                    fileName: _fileName,
                    path: _id
                  });
                })
                .catch(() => {});
            });
          }
        );
      }
    } else {
      const warningMsg = globalString('editor/toolbar/notSupportedInUI', 'openFile');
      NewToaster.show({
        message: warningMsg,
        className: 'danger',
        icon: 'thumbs-down'
      });
    }
  }

  openSQLFile() {
    const editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
    dialog.showOpenDialog(
      BrowserWindow.getFocusedWindow(),
      {
        properties: ['openFile', 'multiSelections'],
        filters: FILE_FILTERS_SQL
      },
      fileNames => {
        if (!fileNames) {
          return;
        }

        _.forEach(fileNames, v => {
          this.props.store
            .openFile(v, ({ _id, content }) => {
              let _fileName = path.basename(_id);
              if (window.navigator.platform.toLowerCase() === 'win32') {
                _fileName = _id.substring(_id.lastIndexOf('\\') + 1, _id.length);
              }

              runInAction(() => {
                editor.fileName = _fileName;
                editor.path = _id;
              });
              editor.doc.cm.setValue(content);
              this.setState({ showLoadSQLWarning: false });
            })
            .catch(() => {});
        });
      }
    );
  }

  saveFileAs() {
    this.props.store.editorToolbar.saveAs = true;
    this.saveFile().catch(e => {
      if (e) {
        l.error('Failed to save file:', e);
      }
    });
  }

  saveFile(currentEditor) {
    if (IS_ELECTRON) {
      currentEditor =
        currentEditor || this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);

      if (!currentEditor) {
        return Promise.reject();
      }

      const _saveFile = path => {
        return featherClient()
          .service('files')
          .create({ _id: path, content: currentEditor.doc.getValue() })
          .then(() => currentEditor.doc.markClean())
          .catch(err => {
            NewToaster.show({
              message: err.message,
              className: 'danger',
              icon: 'thumbs-down'
            });
            throw err;
          });
      };

      if (currentEditor.path && !this.props.store.editorToolbar.saveAs) {
        return _saveFile(currentEditor.path);
      }

      const {
        api: { getUnsavedEditorSuggestedFileName }
      } = this.props;

      return new Promise((resolve, reject) => {
        dialog.showSaveDialog(
          BrowserWindow.getFocusedWindow(),
          {
            defaultPath: path.resolve(
              this.props.store.editorPanel.lastFileSavingDirectoryPath,
              getUnsavedEditorSuggestedFileName(currentEditor)
            ),
            filters: currentEditor.type == EditorTypes.DRILL ? FILE_FILTERS_SQL : FILE_FILTERS
          },
          fileName => {
            this.props.store.editorToolbar.saveAs = false;
            if (!fileName) {
              return reject();
            }
            this.props.store.editorPanel.lastFileSavingDirectoryPath = path.dirname(fileName);
            _saveFile(fileName)
              .then(() => {
                runInAction('update fileName and path', () => {
                  currentEditor.fileName = path.basename(fileName);
                  if (window.navigator.platform.toLowerCase() === 'win32') {
                    currentEditor.fileName = fileName.substring(
                      fileName.lastIndexOf('\\') + 1,
                      fileName.length
                    );
                  }
                  currentEditor.path = fileName;
                  const treeEditor = this.props.store.treeActionPanel.editors.get(currentEditor.id);
                  if (treeEditor) {
                    this.props.store.treeActionPanel.editors.delete(currentEditor.id);
                  }
                });
                this.props.store.watchFileBackgroundChange(currentEditor.id);
                resolve();
              })
              .catch(reject);
          }
        );
      });
    }

    const warningMsg = globalString('editor/toolbar/notSupportedInUI', 'saveFile');
    NewToaster.show({
      message: warningMsg,
      className: 'danger',
      icon: 'thumbs-down'
    });

    return Promise.reject(new Error(warningMsg));
  }

  /**
   * Execute the line currently selected in the active CodeMirror instance.
   * @Mike TODO -> This function can probably be moved to an inline function on the button, as refactors mean the button is disabled if on default editor.
   */
  @action
  executeLine() {
    if (this.props.store.editorPanel.activeEditorId == 'Default') {
      NewToaster.show({
        message: globalString('editor/toolbar/cannotExecuteOnWelcome'),
        className: 'warning',
        icon: 'thumbs-down'
      });
    } else {
      this.props.store.editorPanel.executingEditorLines = true;
    }
  }

  /**
   * Execute all the contents of the currently active CodeMirror instance.
   * @Mike TODO -> This function can probably be moved to an inline function on the button, as refactors mean the button is disabled if on default editor.
   */
  @action
  executeAll() {
    if (this.props.store.editorPanel.activeEditorId == 'Default') {
      NewToaster.show({
        message: globalString('editor/toolbar/cannotExecuteOnWelcome'),
        className: 'warning',
        icon: 'thumbs-down'
      });
    } else {
      this.props.store.editorPanel.executingEditorAll = true;
    }
  }

  /**
   * Stop the current execution on this connection.
   * @Mike TODO -> This function can proably be moved to an inline function on the button, as refactors mean the button is disabled if nothing is executing.
   */
  @action.bound
  stopExecution() {
    if (this.props.store.editorToolbar.isActiveExecuting) {
      this.props.store.editorPanel.stoppingExecution = true;
    } else {
      NewToaster.show({
        message: 'Cannot stop execution. Nothing is executing.',
        className: 'warning',
        icon: 'thumbs-down'
      });
    }
  }

  /**
   * Event triggered when the dropdown changes.
   * @param {Object} event - The event that triggered this action.
   * @param {Object} event.target - The target of the event.
   * @param {String} event.target.value - The new value of the dropdown.
   * @Mike TODO -> I think this entire function can be rewritten to adhere to our new logic, using the API.
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
    const editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
    const profile = this.props.profileStore.profiles.get(
      this.props.store.editorToolbar.currentProfile
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
          swapProfile: true
        })
        .then(res => {
          if (res.shellId) {
            // a new shell got created.
            runInAction('Update dropdown on success', () => {
              this.updateCurrentProfile(profile, res.shellId);
            });
            NewToaster.show({
              message: 'Swapped Profiles.',
              className: 'success',
              icon: 'pt-icon-thumbs-up'
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
                icon: 'thumbs-down'
              });
            } else {
              runInAction('Update dropdown on success', () => {
                this.updateCurrentProfile(profile);
              });
              NewToaster.show({
                message: 'Swapped Profiles.',
                className: 'success',
                icon: 'pt-icon-thumbs-up'
              });
            }
          }
        })
        .catch(err => {
          l.error(err);
          runInAction('Revert dropdown change on failure', () => {
            this.props.store.editorPanel.activeDropdownId = prevDropdown;
            this.props.store.editorToolbar.currentProfile = prevDropdown;
          });
          NewToaster.show({
            message: globalString('editor/toolbar/profileSwapError'),
            className: 'danger',
            icon: 'thumbs-down'
          });
        });
    }
  }

  @action
  updateCurrentProfile(profile, shellId = undefined) {
    const editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
    if (shellId) {
      Broker.emit(EventType.SWAP_SHELL_CONNECTION, {
        oldId: editor.profileId,
        oldShellId: editor.shellId,
        id: profile.id,
        shellId
      });
      editor.shellId = shellId;
      editor.profileId = profile.id;
    }
    editor.currentProfile = profile.id;
    editor.alias = profile.alias;
  }

  /**
   * Render the warning for loading an SQL file.
   */
  @action
  renderSQLImportWarning() {
    return (
      <Dialog
        className="pt-dark loadSQLWarning"
        intent={Intent.PRIMARY}
        isOpen={this.state.showLoadSQLWarning}
      >
        <div className="dialogContent">
          <p> {globalString('drill/loadWarning/warning')} </p>
        </div>
        <div className="dialogButtons">
          <AnchorButton
            className="continueButton"
            type="submit"
            intent={Intent.SUCCESS}
            onClick={this.openSQLFile}
            text={globalString('drill/loadWarning/continue')}
          />
          <AnchorButton
            className="submitButton"
            type="submit"
            intent={Intent.SUCCESS}
            onClick={() => {
              this.setState({ showLoadSQLWarning: false });
            }}
            text={globalString('drill/loadWarning/cancel')}
          />
        </div>
      </Dialog>
    );
  }

  @autobind
  checkExistingEditor(editorType) {
    const treeEditors = this.props.store.treeActionPanel.editors.entries();
    let bExistingEditor = false;
    for (const editor of treeEditors) {
      if (
        editor[1].currentProfile == this.props.store.profileList.selectedProfile.id &&
        editor[1].type == editorType
      ) {
        bExistingEditor = true;
        runInAction('update state var', () => {
          this.props.store.editorPanel.activeEditorId = editor[1].id;
          this.props.store.treeActionPanel.treeActionEditorId = editor[1].id;
        });
        break;
      }
    }
    return bExistingEditor;
  }

  /**
   * Render function for this component.
   */
  render() {
    const profile = this.props.store.profileList.selectedProfile;

    const profiles = [...this.props.profileStore.profiles.entries()];
    const { api } = this.props;
    let hasPerformancePanel = false;
    if (profile) {
      hasPerformancePanel = api.hasPerformancePanel(profile.id);
    }

    return (
      <nav className="pt-navbar editorToolbar">
        <QuickTreeActionDialogue
          profile={profile}
          title="Simple Query"
          subtitle="Please fill in the following form and press okay."
          isOpen={this.state.isSimpleQueryDialogueOpen}
          closeCallBack={() => {
            this.setState({ isSimpleQueryDialogueOpen: false });
          }}
          acceptCallBack={(db, collection) => {
            this.setState({ isSimpleQueryDialogueOpen: false });
            const nodeClicked = {
              text: collection,
              type: 'collection',
              json: { db, text: collection },
              refParent: { json: { text: db }, text: db }
            };
            this.props.store.setTreeAction(nodeClicked, 'SimpleQuery');
            if (this.checkExistingEditor(EditorTypes.TREE_ACTION)) {
              this.props.store.showTreeActionPane(EditorTypes.TREE_ACTION);
            } else {
              this.props.api.addNewEditorForTreeAction({ type: EditorTypes.TREE_ACTION });
            }
          }}
        />
        <QuickTreeActionDialogue
          profile={profile}
          title="Aggregate Builder"
          subtitle="Please fill in the following form and press okay."
          isOpen={this.state.isAggregateQueryDialogueOpen}
          closeCallBack={() => {
            this.setState({ isAggregateQueryDialogueOpen: false });
          }}
          acceptCallBack={(db, collection) => {
            this.setState({ isAggregateQueryDialogueOpen: false });
            const nodeClicked = { text: collection, refParent: { text: db } };
            this.props.store.openNewAggregateBuilder(nodeClicked);
          }}
        />
        {this.renderSQLImportWarning()}
        <div className="pt-navbar-group pt-align-left leftEditorToolbar">
          <div className="pt-navbar-heading">{globalString('editor/toolbar/queryInput')}</div>
          <div className="pt-button-group pt-intent-primary leftButtonGroup">
            <div className="pt-select pt-intent-primary editorContextDropdownWrapper">
              <select
                onChange={this.onDropdownChanged}
                value={this.props.store.editorPanel.activeDropdownId}
                className="pt-intent-primary editorContextDropdown"
              >
                <option key="Default" value="Default">
                  {globalString('editor/toolbar/noActiveConnection')}
                </option>
                ;{' '}
                {profiles.map(profile => {
                  if (profile[1].status == 'OPEN') {
                    return (
                      <option key={profile[0]} value={profile[1].id}>
                        {profile[1].alias}
                      </option>
                    );
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
              />
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
              />
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
                <StopExecutionIcon className="dbKodaSVG" width={20} height={20} />
              </AnchorButton>
            </Tooltip>
          </div>
        </div>

        <div className="pt-button-group pt-navbar-group pt-intent-primary perfButtonGroup">
          <Tooltip
            intent={Intent.DANGER}
            hoverOpenDelay={1000}
            content={globalString('profile/menu/simpleQuery')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}
          >
            <AnchorButton
              disabled={
                this.props.store.profileList.selectedProfile &&
                this.props.store.profileList.selectedProfile.status === 'CLOSED'
              }
              className="pt-button pt-intent-primary simpleQuery"
              onClick={() => {
                this.setState({ isSimpleQueryDialogueOpen: true });
              }}
              icon="pt-icon-heat-grid"
            >
              <SearchIcon className="dbKodaSVG" width={20} height={20} />
            </AnchorButton>
          </Tooltip>
          <Tooltip
            intent={Intent.DANGER}
            hoverOpenDelay={1000}
            content={globalString('profile/menu/aggregateBuilder')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}
          >
            <AnchorButton
              disabled={
                this.props.store.profileList.selectedProfile &&
                this.props.store.profileList.selectedProfile.status === 'CLOSED'
              }
              className="pt-button pt-intent-primary aggregateBuilder"
              onClick={() => {
                this.setState({ isAggregateQueryDialogueOpen: true });
              }}
              icon="pt-icon-heat-grid"
            >
              <AggregateIcon className="dbKodaSVG" width={20} height={20} />
            </AnchorButton>
          </Tooltip>
          <Tooltip
            intent={Intent.DANGER}
            hoverOpenDelay={1000}
            content={globalString(
              `profile/menu/${
                !hasPerformancePanel ? 'createPerformancePanel' : 'openPerformancePanel'
              }`
            )}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}
          >
            <AnchorButton
              disabled={
                this.props.store.profileList.selectedProfile &&
                this.props.store.profileList.selectedProfile.status === 'CLOSED'
              }
              className={`pt-button pt-intent-primary ${
                !hasPerformancePanel ? 'createPerformancePanel' : 'openPerformancePanel'
              }`}
              onClick={() => {
                // Emit event for performance panel
                Broker.emit(EventType.FEATURE_USE, 'PerformancePanel');
                this.props.api.transformPerformancePanel(
                  profile.id,
                  performancePanelStatuses.external
                );
                this.forceUpdate();
              }}
              icon="pt-icon-heat-grid"
            >
              <PerfPanelIcon className="dbKodaSVG" width={20} height={20} />
            </AnchorButton>
          </Tooltip>
          <Tooltip
            intent={Intent.DANGER}
            hoverOpenDelay={1000}
            content={globalString('profile/menu/storageDrilldown')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}
          >
            <AnchorButton
              disabled={
                this.props.store.profileList.selectedProfile &&
                this.props.store.profileList.selectedProfile.status === 'CLOSED'
              }
              className="pt-button pt-intent-primary storageDrilldownView"
              onClick={() => {
                l.debug(this.props.store.profileList.selectedProfile);
                this.props.api.showStorageStatsView(
                  this.props.store.profileList.selectedProfile.id
                );
              }}
              icon="pt-icon-heat-grid"
            >
              <ChartIcon className="dbKodaSVG" width={20} height={20} />
            </AnchorButton>
          </Tooltip>
        </div>
        <div className="pt-navbar-group pt-align-right">
          <div className="pt-button-group pt-navbar-group pt-intent-primary rightHandGroup">
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content={globalString('editor/toolbar/addEditorTooltip')}
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}
            >
              <AnchorButton
                className="pt-button pt-intent-primary addEditorButton"
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
                className="pt-button pt-intent-primary openFileButton"
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
                className="pt-button pt-intent-primary saveFileButton"
                onClick={this.saveFileHandleError}
                disabled={this.props.store.editorPanel.activeEditorId === 'Default'}
              >
                <SaveFileIcon className="dbKodaSVG" width={20} height={20} />
              </AnchorButton>
            </Tooltip>
          </div>
        </div>
      </nav>
    );
  }
}
