/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-03-07T11:39:01+11:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-04-24T13:07:53+10:00
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

import React from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import { reaction, runInAction, observable, action } from 'mobx';
import { Classes, ITreeNode, Tree } from '@blueprintjs/core';
import { Broker, EventType } from '~/helpers/broker';
import {
  ContextMenuTarget,
  Menu,
  MenuItem,
  MenuDivider,
  Intent,
  AnchorButton,
  Dialog
} from '@blueprintjs/core';
import { NewToaster } from '#/common/Toaster';
import findElementAttributeUpward from '~/helpers/findElementAttributeUpward';
import TreeActions from './templates/tree-actions/actions.json';
import SettingsIcon from '../../styles/icons/settings-icon.svg';
import DocumentIcon from '../../styles/icons/document-solid-icon.svg';
import UserIcon from '../../styles/icons/users-icon-1.svg';
import RemoveUserIcon from '../../styles/icons/users-icon-2.svg';
import AddIcon from '../../styles/icons/add-icon.svg';
import CloseIcon from '../../styles/icons/cross-icon.svg';
import ShardsIcon from '../../styles/icons/shards-icon-2.svg';
import CollectionIcon from '../../styles/icons/collection-icon.svg';
import DropdownIcon from '../../styles/icons/dropdown-menu-icon.svg';
import { EditorTypes, BackupRestoreActions, TableViewConstants } from '../common/Constants';
import { performancePanelStatuses } from '../../api/PerformancePanel';

import TreeState from './model/TreeState.js';
import './View.scss';

@inject(allStores => ({
  store: allStores.store,
  treeState: allStores.treeState,
  profileStore: allStores.profileStore,
  api: allStores.api,
  config: allStores.config
}))
@ContextMenuTarget
export default class TreeView extends React.Component {
  static get defaultProps() {
    return {
      treeState: {},
      /* eslint-disable react/default-props-match-prop-types */
      store: {
        treeActionPanel: {
          treeActionEditorId: ''
        }
      }
    };
  }
  constructor(props) {
    super(props);
    this.props.treeState.updateCallback = () => {
      this.setState({ nodes: this.props.treeState.nodes });
    };

    this.props.treeState.updateCallback2 = () => {
      return this.props.store.profileList.selectedProfile;
    };

    this.state = {
      nodes: this.props.treeState.nodes,
      isPasswordDialogVisible: false,
      isLoadingDialogVisible: false,
      remotePass: null,
      showDrillDownloaderStatus: false,
      showDrillNotFoundDialog: false,
      drillDownloadFunction: null,
      drillDontDownloadFunction: null
    };
  }
  componentWillMount() {
    const onNewJson = () => {
      runInAction('update state var', () => {
        if (this.props.treeState.isNewJsonAvailable) {
          this.setState({ nodes: this.props.treeState.nodes });
          this.props.treeState.isNewJsonAvailable = false;
        }
      });
    };
    this.reactionToJson = reaction(
      () => this.props.treeState.isNewJsonAvailable,
      () => onNewJson()
    );
    this.reactionToFilter = reaction(
      () => this.props.treeState.filter,
      () => {
        this.setState({ nodes: this.props.treeState.nodes });
      }
    );
    this.reactionToContextMenuAction = reaction(
      () => this.props.store.treePanel.action,
      () => {
        if (this.props.store.treePanel.action) {
          this.handleTreeActionClick(this.props.store.treePanel.action, true);
          this.props.store.treePanel.action = null;
        }
      }
    );
    onNewJson();
    if (IS_ELECTRON) {
      const electron = window.require('electron');
      electron.ipcRenderer.on('updateDrillStatus', this.handleDrillDownloaderCommand);
    }
  }
  componentWillUnmount() {
    this.reactionToJson();
    this.reactionToFilter();
    if (IS_ELECTRON) {
      const electron = window.require('electron');
      electron.ipcRenderer.removeListener('updateDrillStatus', this.handleDrillDownloaderCommand);
    }
  }
  getActionByName(actionName) {
    if (this.nodeRightClicked) {
      const Actions = TreeActions[this.nodeRightClicked.type];
      const namedAction = Actions.find(action => {
        return action.name == actionName;
      });
      if (namedAction) {
        return namedAction;
      }
    }
    return null;
  }

  getNoDialogByName(actionName) {
    if (this.nodeRightClicked) {
      const Actions = TreeActions[this.nodeRightClicked.type];
      const namedAction = Actions.find(action => {
        return action.name == actionName;
      });
      if (namedAction) {
        return namedAction.noDialog;
      }
    }
    return null;
  }

  getIconFor(icon) {
    switch (icon) {
      case 'settings':
        return <SettingsIcon className="pt-icon dbKodaSVG" width={16} height={16} />;
      case 'document':
        return <DocumentIcon className="pt-icon dbKodaSVG" width={16} height={16} />;
      case 'user':
        return <UserIcon className="pt-icon dbKodaSVG" width={16} height={16} />;
      case 'remove-user':
        return <RemoveUserIcon className="pt-icon dbKodaSVG" width={16} height={16} />;
      case 'add':
        return <AddIcon className="pt-icon dbKodaSVG" width={16} height={16} />;
      case 'close':
        return <CloseIcon className="pt-icon dbKodaSVG" width={16} height={16} />;
      case 'shards':
        return <ShardsIcon className="pt-icon dbKodaSVG" width={16} height={16} />;
      case 'collection':
        return <CollectionIcon className="pt-icon dbKodaSVG" width={16} height={16} />;
      case 'dropdown':
        return <DropdownIcon className="pt-icon dbKodaSVG" width={16} height={16} />;
      default:
        return null;
    }
  }

  getContextMenu() {
    if (this.nodeRightClicked) {
      const Actions = TreeActions[this.nodeRightClicked.type];
      const Menus = [];
      Menus.push(
        <MenuItem
          onClick={this.handleMakeRoot}
          text="Make Root Node"
          key="MakeRoot"
          name="MakeRoot"
          icon="git-new-branch"
          intent={Intent.NONE}
        />
      );
      if (Actions && Actions.length > 0) {
        Menus.push(<MenuDivider key="divider" />);
        for (const objAction of Actions) {
          // icon={objAction.icon}
          if (
            objAction.name === 'ShowPerformancePanel' &&
            this.props.store.profileList.selectedProfile
          ) {
            const hasPerformancePanel = this.props.api.hasPerformancePanel(
              this.props.store.profileList.selectedProfile.id
            );
            objAction.text = globalString(
              `profile/menu/${
                !hasPerformancePanel ? 'createPerformancePanel' : 'openPerformancePanel'
              }`
            );
          }
          if (objAction.type && objAction.type == 'divider') {
            Menus.push(<MenuDivider key={objAction.name} />);
          } else {
            let bDevOnlyFeature = false;
            if (process.env.NODE_ENV !== 'development' && objAction.development) {
              bDevOnlyFeature = true;
            }
            if (!bDevOnlyFeature) {
              const icon = this.getIconFor(objAction.icon);
              if (icon != null) {
                Menus.push(
                  <div className="menuItemWrapper" key={objAction.name} data-id={objAction.name}>
                    <MenuItem
                      onClick={this.handleTreeActionClick}
                      text={objAction.text}
                      key={objAction.name}
                      icon={icon}
                      intent={Intent.NONE}
                    />
                  </div>
                );
              } else {
                Menus.push(
                  <div className="menuItemWrapper" key={objAction.name} data-id={objAction.name}>
                    <MenuItem
                      onClick={this.handleTreeActionClick}
                      text={objAction.text}
                      key={objAction.name}
                      icon={objAction.icon}
                      intent={Intent.NONE}
                    />
                  </div>
                );
              }
            }
          }
        }
      }
      return <Menu>{Menus}</Menu>;
    }
  }
  reactionToJson;
  reactionToFilter;

  handleNodeClick = (nodeData: ITreeNode, _nodePath: number[]) => {
    if (nodeData.text == '...') {
      this.props.treeState.resetRootNode();
    } else {
      this.props.treeState.selectNode(nodeData);
    }
    this.setState({ nodes: this.props.treeState.nodes });
  };

  handleNodeDoubleClick = (nodeData: ITreeNode, _nodePath: number[]) => {
    if (nodeData.text == '...') {
      this.props.treeState.resetRootNode();
    } else if (nodeData.type === 'collection') {
      // this.props.treeState.selectNode(nodeData);
      console.log('Double clicked Node:');
      console.log('Collection: ', nodeData.text);
      this.props.api.treeApi.openNewTableViewForCollection(
        {
          collection: nodeData.text,
          database: nodeData.refParent.text
        },
        TableViewConstants.DEFAULT_MAX_ROWS
      );
    }
    // this.setState({ nodes: this.props.treeState.nodes });
  };

  handleNodeContextMenu = (nodeData: ITreeNode, _nodePath: number[]) => {
    this.nodeRightClicked = nodeData;
    this.props.treeState.selectNode(nodeData);
    this.setState({ nodes: this.props.treeState.nodes });
  };

  handleNodeCollapse = (nodeData: ITreeNode) => {
    nodeData.isExpanded = false;
    this.setState({ nodes: this.props.treeState.nodes });
  };

  handleNodeExpand = (nodeData: ITreeNode) => {
    nodeData.isExpanded = true;
    this.setState({ nodes: this.props.treeState.nodes });
  };

  handleMakeRoot = () => {
    if (this.nodeRightClicked) {
      this.props.treeState.selectRootNode(this.nodeRightClicked);
      this.setState({ nodes: this.props.treeState.nodes });
    }
  };

  isBackupRestoreAction = action => {
    return (
      action === BackupRestoreActions.EXPORT_DATABASE ||
      action === BackupRestoreActions.EXPORT_COLLECTION ||
      action === BackupRestoreActions.DUMP_DATABASE ||
      action === BackupRestoreActions.DUMP_COLLECTION ||
      action === BackupRestoreActions.IMPORT_COLLECTION ||
      action === BackupRestoreActions.IMPORT_DATABASE ||
      action === BackupRestoreActions.DUMP_SERVER ||
      action === BackupRestoreActions.RESTORE_DATABASE ||
      action === BackupRestoreActions.RESTORE_COLLECTION ||
      action === BackupRestoreActions.RESTORE_SERVER
    );
  };

  @action
  handleTreeActionClick = (e: React.MouseEvent, isTriggeredFromButton: boolean) => {
    if (isTriggeredFromButton) {
      this.nodeRightClicked = this.props.store.treePanel.nodeOpened;
    }
    console.log(this.nodeRightClicked);
    const action = findElementAttributeUpward(e.target, 'data-id');
    const noDialog = this.getNoDialogByName(action);
    this.actionSelected = this.getActionByName(action);
    if (noDialog) {
      switch (action) {
        case 'SampleCollections':
          this.props.treeState.sampleCollection(this.nodeRightClicked);
          break;
        case 'AggregateBuilder':
          this.props.store.openNewAggregateBuilder(this.nodeRightClicked);
          break;
        case 'DbStorageStats':
          this.props.api.showStorageStatsView();
          break;
        case 'ShowPerformancePanel':
          this.showPerformancePanel();
          break;
        case 'DrillDatabase':
          this.openDrillEditor();
          break;
        case 'TableView':
          this.props.api.treeApi.openNewTableViewForCollection(
            {
              collection: this.nodeRightClicked.text,
              database: this.nodeRightClicked.refParent.text
            },
            TableViewConstants.DEFAULT_MAX_ROWS
          );
          break;
        default:
          console.error('Tree Action not defined: ', action);
          break;
      }
    } else if (this.nodeRightClicked) {
      Broker.emit(EventType.FEATURE_USE, 'TreeAction_' + action);
      if (
        this.actionSelected &&
        this.actionSelected.view &&
        this.actionSelected.view == 'details'
      ) {
        this.showDetailsView(this.nodeRightClicked, action);
      } else if (this.isBackupRestoreAction(action)) {
        this.showTreeActionPanel(this.nodeRightClicked, action, EditorTypes.SHELL_COMMAND);
      } else {
        this.showTreeActionPanel(this.nodeRightClicked, action, EditorTypes.TREE_ACTION);
      }
    }
  };

  checkExistingEditor = editorType => {
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
  };

  showTreeActionPanel = (treeNode, action, editorType) => {
    this.props.store.setTreeAction(treeNode, action);
    if (this.checkExistingEditor(editorType)) {
      this.props.store.showTreeActionPane(editorType);
    } else {
      this.props.api.addNewEditorForTreeAction({ type: editorType });
    }
  };

  showDetailsView = (treeNode, action) => {
    runInAction('Using active editor for tree details action', () => {
      this.props.store.treeActionPanel.treeNode = treeNode;
      this.props.store.treeActionPanel.treeAction = action;
      const editorId = this.props.store.editorPanel.activeEditorId;
      if (editorId) {
        const editor = this.props.store.editors.get(editorId);
        this.props.store.editors.set(
          editorId,
          observable({
            ...editor,
            detailsView: {
              visible: true,
              treeNode,
              treeAction: action,
              currentProfile: editor.currentProfile
            }
          })
        );
      }
    });
  };

  showPerformancePanel = () => {
    if (this.props.store.profileList.selectedProfile) {
      this.props.api.transformPerformancePanel(
        this.props.store.profileList.selectedProfile.id,
        performancePanelStatuses.external
      );
    }
  };

  @action.bound
  handleDrillDownloaderCommand = (event, command, message) => {
    console.log('command: ', command, ', message:', message);
    if (command === 'START') {
      if (message === 'drill') {
        // this.setState({
        //   drillStatusMsg: globalString('drill/downloading_drill')
        // });
        this.props.store.treePanel.drillStatusMsg = globalString(
          'drill/status_bar/downloading_drill'
        );
      } else {
        // this.setState({
        //   drillStatusMsg: globalString('drill/downloading_drill_controller')
        // });
        this.props.store.treePanel.drillStatusMsg = globalString(
          'drill/status_bar/downloading_drill_controller'
        );
      }
    } else if (command === 'DOWNLOADING') {
      // this.setState({
      //   drillDownloadProgress: message
      // });
      this.props.store.treePanel.downloadingDrill = true;
      this.props.store.treePanel.drillDownloadProgress = message;
    } else if (command === 'COMPLETE') {
      const drillCmd = message.split('|');
      console.log('drillCmd:', drillCmd);
      if (drillCmd[0] == 'drillCmd') {
        // this.setState({
        //   drillStatusMsg: globalString('drill/drill_download_success'),
        //   drillDownloadProgress: null
        // });
        this.props.store.treePanel.drillDownloadProgress = message;
        this.props.store.treePanel.drillStatusMsg = globalString(
          'drill/status_bar/drill_download_success'
        );
      } else {
        // this.setState({
        //   drillStatusMsg: globalString('drill/drill_controller_download_success'),
        //   drillDownloadProgress: null
        // });
        this.props.store.treePanel.drillDownloadProgress = null;
        this.props.store.treePanel.drillStatusMsg = globalString(
          'drill/status_bar/drill_download_success'
        );
      }
      this.props.store.treePanel.downloadingDrill = false;
      this.saveDrillCmd(drillCmd[0], drillCmd[1]);
    } else if (command === 'ERROR') {
      // this.setState({
      //   drillStatusMsg: globalString('drill/drill_download_failed')
      // });
      this.props.store.treePanel.downloadingDrill = false;
      this.props.store.treePanel.drillStatusMsg = globalString(
        'drill/status_bar/drill_download_failed'
      );
    }
  };

  @action.bound
  saveDrillCmd(cmd, path) {
    this.props.config.patch({
      [cmd]: path
    });
  }

  checkForDrill = () => {
    const electron = window.require('electron');
    const { ipcRenderer, remote } = electron;
    const electronFS = remote.require('fs');

    return new Promise((resolve, reject) => {
      const drillPathExists = electronFS.existsSync(this.props.config.settings.drillCmd);
      console.log('drillPathExists::', drillPathExists);
      if (
        this.props.config.settings.drillCmd == null ||
        this.props.config.settings.drillCmd == '' ||
        !drillPathExists
      ) {
        const downloadDrill = () => {
          this.setState({
            showDrillNotFoundDialog: false,
            showDrillDownloaderStatus: true,
            isLoadingDialogVisible: true
          });
          runInAction(() => {
            this.props.store.treePanel.downloadingDrill = true;
            this.props.store.treePanel.showDrillStatus = true;
          });
          ipcRenderer.send('drill', 'downloadDrill');
          ipcRenderer.once('drillResult', (event, arg) => {
            if (arg == 'downloadDrillComplete') {
              resolve(true);
            }
          });
        };
        const dontDownloadDrill = () => {
          this.setState({
            showDrillNotFoundDialog: false
          });
          reject(false); // eslint-disable-line prefer-promise-reject-errors
        };

        this.setState({
          showDrillNotFoundDialog: true,
          drillDownloadFunction: downloadDrill,
          drillDontDownloadFunction: dontDownloadDrill
        });
      } else {
        resolve(true);
      }
    });
  };

  checkForDrillController = () => {
    const electron = window.require('electron');
    const { ipcRenderer, remote } = electron;
    const electronFS = remote.require('fs');
    return new Promise((resolve, reject) => {
      const drillCtrlPathExists = electronFS.existsSync(
        this.props.config.settings.drillControllerCmd
      );
      console.log('drillCtrlPathExists::', drillCtrlPathExists);
      if (
        this.props.config.settings.drillControllerCmd == null ||
        this.props.config.settings.drillControllerCmd == '' ||
        !drillCtrlPathExists
      ) {
        ipcRenderer.send('drill', 'downloadController');
        ipcRenderer.once('drillResult', (event, arg) => {
          if (arg == 'downloadDrillControllerComplete') {
            this.setState({
              showDrillDownloaderStatus: false,
              isLoadingDialogVisible: false
            });
            runInAction(() => {
              this.props.store.treePanel.downloadingDrill = false;
              this.props.store.treePanel.showDrillStatus = false;
            });
            resolve(true);
          }
          reject(false); // eslint-disable-line prefer-promise-reject-errors
        });
      } else {
        resolve(true);
      }
    });
  };

  addNewEditorForDrill = () => {
    const profile = this.props.store.profileList.selectedProfile;
    if (profile.sshTunnel) {
      NewToaster.show({
        message: 'MongoDB connections using SSH Tunnel are not supported by Apache Drill.',
        className: 'danger',
        icon: 'thumbs-down'
      });
      return;
    }

    const drillProfileId = this.props.api.checkForExistingDrillProfile({
      db: this.nodeRightClicked.text
    });
    if (!drillProfileId) {
      if (
        this.props.store.profileList.selectedProfile &&
        this.props.store.profileList.selectedProfile.status == 'OPEN'
      ) {
        if (this.props.store.profileList.selectedProfile.sha) {
          this.setState({ isPasswordDialogVisible: true });
        } else {
          this.setState({ isLoadingDialogVisible: true });
          runInAction(() => {
            this.props.store.treePanel.downloadingDrill = true;
          });
          this.props.api.addNewEditorForDrill({
            db: this.nodeRightClicked.text,
            cbFunc: this.onDrillEditorAdded
          });
        }
      }
    } else {
      this.props.api.openEditorWithDrillProfileId(drillProfileId);
    }
  };

  openDrillEditor = () => {
    this.checkForDrill()
      .then(bDrill => {
        bDrill &&
          this.checkForDrillController().then(bDrillController => {
            bDrillController && this.addNewEditorForDrill();
          });
      })
      .catch(() => {
        console.log('user canceled');
      });
  };
  onDrillEditorAdded = (response, errorCode) => {
    this.setState({ isLoadingDialogVisible: false });
    runInAction(() => {
      this.props.store.treePanel.downloadingDrill = false;
    });
    if (response === 'error') {
      let message = globalString('drill/open_drill_editor_failed');
      if (errorCode === 'DRILL_BINARY_UNDETECTED') {
        message = globalString('drill/drill_binary_not_defined');
      } else if (errorCode == 'JAVA_UNDETECTED') {
        message = globalString('drill/java_not_found');
      }
      NewToaster.show({
        message,
        className: 'danger',
        icon: 'thumbs-down'
      });
    } else {
      NewToaster.show({
        message: globalString('drill/drill_editor_open_success'),
        className: 'success',
        icon: 'pt-icon-thumbs-up'
      });
    }
  };
  closePasswordDialog = () => {
    this.setState({ isPasswordDialogVisible: false });
  };

  openDrillEditorWithPass = () => {
    this.setState({ isLoadingDialogVisible: true });
    runInAction(() => {
      this.props.store.treePanel.downloadingDrill = true;
    });
    this.props.api.addNewEditorForDrill({
      db: this.nodeRightClicked.text,
      pass: this.state.remotePass,
      cbFunc: this.onDrillEditorAdded
    });
    this.setState({ isPasswordDialogVisible: false });
  };

  nodeRightClicked;
  actionSelected;

  renderContextMenu() {
    return this.getContextMenu();
  }

  render() {
    const classNames = `${Classes.ELEVATION_0} ${Classes.DARK}`;
    return (
      <div className="sb-tree-view">
        <Tree
          contents={this.state.nodes}
          onNodeClick={this.handleNodeClick}
          onNodeDoubleClick={this.handleNodeDoubleClick}
          onNodeCollapse={this.handleNodeCollapse}
          onNodeExpand={this.handleNodeExpand}
          onNodeContextMenu={this.handleNodeContextMenu}
          className={classNames}
        />

        <Dialog
          className="pt-dark drill-alert-dialog"
          intent={Intent.PRIMARY}
          isOpen={this.state.showDrillNotFoundDialog}
          title={globalString('drill/drill_not_configured_title')}
          onClose={this.state.drillDontDownloadFunction}
        >
          <div className="dialogContent">
            <p>{globalString('drill/drill_not_configured_message')}</p>
          </div>
          <div className="dialogButtons">
            <AnchorButton
              className="openButton"
              intent={Intent.SUCCESS}
              type="submit"
              onClick={this.state.drillDownloadFunction}
              text="Sure"
            />
            <AnchorButton
              className="cancelButton"
              intent={Intent.DANGER}
              text="Cancel"
              onClick={this.state.drillDontDownloadFunction}
            />
          </div>
        </Dialog>
        <Dialog
          className="pt-dark open-profile-alert-dialog"
          intent={Intent.PRIMARY}
          isOpen={this.state.isPasswordDialogVisible}
        >
          <div className="dialogContent">
            <p>{globalString('profile/openAlert/passwordPrompt')}</p>
            <input
              autoFocus // eslint-disable-line jsx-a11y/no-autofocus
              className="pt-input passwordInput"
              placeholder={globalString('profile/openAlert/passwordPlaceholder')}
              type="password"
              dir="auto"
              onChange={event => {
                this.setState({ remotePass: event.target.value });
              }}
            />
          </div>
          <div className="dialogButtons">
            <AnchorButton
              className="openButton"
              intent={Intent.SUCCESS}
              type="submit"
              onClick={this.openDrillEditorWithPass}
              text={globalString('profile/openAlert/confirmButton')}
            />
            <AnchorButton
              className="cancelButton"
              intent={Intent.DANGER}
              text={globalString('profile/openAlert/cancelButton')}
              onClick={this.closePasswordDialog}
            />
          </div>
        </Dialog>
      </div>
    );
  }
}

TreeView.propTypes = {
  treeState: PropTypes.instanceOf(TreeState)
};
