/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-03-07T11:39:01+11:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-09-11T09:07:31+10:00
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
  Dialog,
} from '@blueprintjs/core';
import { NewToaster } from '#/common/Toaster';
import LoadingView from '#/common/LoadingView';
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

import TreeState from './model/TreeState.js';
import './View.scss';

@inject(allStores => ({
  store: allStores.store,
  treeState: allStores.treeState,
  profileStore: allStores.profileStore,
  api: allStores.api,
}))
@ContextMenuTarget
export default class TreeView extends React.Component {
  static get defaultProps() {
    return {
      treeState: {},
      /* eslint-disable react/default-props-match-prop-types */
      store: {
        treeActionPanel: {
          treeActionEditorId: '',
        },
      },
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
      () => onNewJson(),
    );
    this.reactionToFilter = reaction(
      () => this.props.treeState.filter,
      () => {
        this.setState({ nodes: this.props.treeState.nodes });
      },
    );
    onNewJson();
  }
  componentWillUnmount() {
    this.reactionToJson();
    this.reactionToFilter();
  }
  getActionByName(actionName) {
    if (this.nodeRightClicked) {
      const Actions = TreeActions[this.nodeRightClicked.type];
      const namedAction = Actions.find((action) => {
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
      const namedAction = Actions.find((action) => {
        return action.name == actionName;
      });
      if (namedAction) {
        return namedAction.noDialog;
      }
    }
    return null;
  }

  getIconFor(iconName) {
    switch (iconName) {
      case 'settings':
        return <SettingsIcon className="dbKodaSVG" width={20} height={20} />;
      case 'document':
        return <DocumentIcon className="dbKodaSVG" width={20} height={20} />;
      case 'user':
        return <UserIcon className="dbKodaSVG" width={20} height={20} />;
      case 'remove-user':
        return <RemoveUserIcon className="dbKodaSVG" width={20} height={20} />;
      case 'add':
        return <AddIcon className="dbKodaSVG" width={20} height={20} />;
      case 'close':
        return <CloseIcon className="dbKodaSVG" width={20} height={20} />;
      case 'shards':
        return <ShardsIcon className="dbKodaSVG" width={20} height={20} />;
      case 'collection':
        return <CollectionIcon className="dbKodaSVG" width={20} height={20} />;
      case 'dropdown':
        return <DropdownIcon className="dbKodaSVG" width={20} height={20} />;
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
          iconName="pt-icon-git-new-branch"
          intent={Intent.NONE}
        />,
      );
      if (Actions && Actions.length > 0) {
        Menus.push(<MenuDivider key="divider" />);
        for (const objAction of Actions) {
          // iconName={objAction.icon}
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
                  <div className="menuItemWrapper">
                    {icon}
                    <MenuItem
                      onClick={this.handleTreeActionClick}
                      text={objAction.text}
                      name={objAction.name}
                      key={objAction.name}
                      intent={Intent.NONE}
                    />
                  </div>,
                );
              } else {
                Menus.push(
                  <div className="menuItemWrapper">
                    {icon}
                    <MenuItem
                      onClick={this.handleTreeActionClick}
                      text={objAction.text}
                      name={objAction.name}
                      key={objAction.name}
                      iconName={objAction.icon}
                      intent={Intent.NONE}
                    />
                  </div>,
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

  isBackupRestoreAction = (action) => {
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
  handleTreeActionClick = (e: React.MouseEvent) => {
    const action = e._targetInst._currentElement._owner._instance.props.name;
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
          this.showStorageStatsView();
          break;
        case 'DrillDatabase':
          this.openDrillEditor();
          break;
        case 'TableView':
          this.props.api.treeApi.openNewTableViewForCollection(
            {
              collection: this.nodeRightClicked.text,
              database: this.nodeRightClicked.refParent.text,
            },
            TableViewConstants.DEFAULT_MAX_ROWS,
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

  checkExistingEditor = (editorType) => {
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
              currentProfile: editor.currentProfile,
            },
          }),
        );
      }
    });
  };

  showStorageStatsView = () => {
    runInAction('Using Active profile to store statistics', () => {
      const selectedProfile = this.props.store.profileList.selectedProfile;
      this.props.store.profileList.selectedProfile = observable({
        ...selectedProfile,
        storageView: {
          visible: true,
          shouldFocus: true,
        },
      });
      this.props.profileStore.profiles.set(
        selectedProfile.id,
        this.props.store.profileList.selectedProfile,
      );
    });
  };

  openDrillEditor = () => {
    const drillProfileId = this.props.api.checkForExistingDrillProfile({
      db: this.nodeRightClicked.text,
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
          this.props.api.addNewEditorForDrill({
            db: this.nodeRightClicked.text,
            cbFunc: this.onDrillEditorAdded,
          });
        }
      }
    } else {
      this.props.api.openEditorWithDrillProfileId(drillProfileId);
    }
  };
  onDrillEditorAdded = (response, errorCode) => {
    this.setState({ isLoadingDialogVisible: false });
    if (response === 'error') {
      let message = globalString('drill/open_drill_editor_failed');
      if (errorCode === 'DRILL_BINARY_UNDETECTED') {
        message = globalString('drill/drill_binary_not_defined');
      }
      NewToaster.show({
        message,
        className: 'danger',
        iconName: 'pt-icon-thumbs-down',
      });
    } else {
      NewToaster.show({
        message: globalString('drill/drill_editor_open_success'),
        className: 'success',
        iconName: 'pt-icon-thumbs-up',
      });
    }
  };
  closePasswordDialog = () => {
    this.setState({ isPasswordDialogVisible: false });
  };

  openDrillEditorWithPass = () => {
    this.props.api.addNewEditorForDrill({
      db: this.nodeRightClicked.text,
      pass: this.state.remotePass,
      cbFunc: this.onDrillEditorAdded,
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
          onNodeCollapse={this.handleNodeCollapse}
          onNodeExpand={this.handleNodeExpand}
          onNodeContextMenu={this.handleNodeContextMenu}
          className={classNames}
        />
        <Dialog
          className="pt-dark open-profile-alert-dialog"
          intent={Intent.PRIMARY}
          isOpen={this.state.isLoadingDialogVisible}
        >
          <div className="dialogContent" style={{ height: '120px' }}>
            <p>Starting Apache Drill...</p>
            <LoadingView />
            <br />
            <br />
            <p>Note: This process might take almost 2 minutes on first start.</p>
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
              onChange={(event) => {
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
  treeState: React.PropTypes.instanceOf(TreeState),
};
