/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-07T11:39:01+11:00
* @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-23T15:31:20+10:00
*/

import React from 'react';
import {inject} from 'mobx-react';
import { reaction, runInAction } from 'mobx';
import { Classes, ITreeNode, Tree } from '@blueprintjs/core';
import {ContextMenuTarget, Menu, MenuItem, MenuDivider, Intent} from '@blueprintjs/core';
import TreeActions from './templates/tree-actions/actions.json';

import TreeState from './model/TreeState.js';
import './View.scss';

@inject(allStores => ({store: allStores.store, treeState: allStores.treeState}))
@ContextMenuTarget
export default class TreeView extends React.Component {
  static get defaultProps() {
    return {
      treeState: {},
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
      this.setState({nodes: this.props.treeState.nodes});
    };

   this.props.treeState.updateCallback2 = () => {
      return this.props.store.profileList.selectedProfile;
    };

    this.state = {nodes: this.props.treeState.nodes};
  }
  componentWillMount() {
    const onNewJson = () => {
      runInAction('update state var', () => {
        if (this.props.treeState.isNewJsonAvailable) {
          this.setState({nodes: this.props.treeState.nodes});
          this.props.treeState.isNewJsonAvailable = false;
        }
      });
    };
    this.reactionToJson = reaction(() => this.props.treeState.isNewJsonAvailable, () => onNewJson());
    this.reactionToFilter = reaction(() => this.props.treeState.filter, () => {
      this.setState({nodes: this.props.treeState.nodes});
    });
    onNewJson();

    this.reactionToTreeAction = reaction(
      () => this.props.store.treeActionPanel.treeActionEditorId,
      () => {
        if (this.props.store.treeActionPanel.treeActionEditorId != '') {
            this.props.store.showTreeActionPane();

          // this.props.store.treeActionPanel.treeActionEditorId = '';  // will update this in the dialog execution.
        }
      }
    );
  }
  componentWillUnmount() {
    this.reactionToJson();
    this.reactionToFilter();
    this.reactionToTreeAction();
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

  getContextMenu() {
    if (this.nodeRightClicked) {
      const Actions = TreeActions[this.nodeRightClicked.type];
      const Menus = [];
      Menus.push(<MenuItem
        onClick={this.handleMakeRoot}
        text="Make Root Node"
        key="MakeRoot"
        name="MakeRoot"
        iconName="pt-icon-git-new-branch"
        intent={Intent.NONE} />);
      if (Actions && Actions.length > 0) {
        Menus.push(<MenuDivider key="divider" />);
        for (const objAction of Actions) {
          Menus.push(<MenuItem
            onClick={this.handleTreeActionClick}
            text={objAction.text}
            name={objAction.name}
            key={objAction.name}
            iconName={objAction.icon}
            intent={Intent.NONE} />);
        }
      }
      return (<Menu>{Menus}</Menu>);
    }
  }
  reactionToJson;
  reactionToFilter;
  reactionToTreeAction;
  handleNodeClick = (nodeData: ITreeNode, _nodePath: number[]) => {
    if (nodeData.text == '...') {
      this.props.treeState.resetRootNode();
    } else {
      this.props.treeState.selectNode(nodeData);
    }
    this.setState({nodes: this.props.treeState.nodes});
  };

  handleNodeContextMenu = (nodeData: ITreeNode, _nodePath: number[]) => {
    this.nodeRightClicked = nodeData;
    this.props.treeState.selectNode(nodeData);
    this.setState({nodes: this.props.treeState.nodes});
  };

  handleNodeCollapse = (nodeData: ITreeNode) => {
    nodeData.isExpanded = false;
    this.setState({nodes: this.props.treeState.nodes});
  };

  handleNodeExpand = (nodeData: ITreeNode) => {
    nodeData.isExpanded = true;
    this.setState({nodes: this.props.treeState.nodes});
  };

  handleMakeRoot = () => {
    if (this.nodeRightClicked) {
      this.props.treeState.selectRootNode(this.nodeRightClicked);
      this.setState({nodes: this.props.treeState.nodes});
    }
  };
  handleTreeActionClick = (e: React.MouseEvent) => {
    const action = e._targetInst._currentElement._owner._instance.props.name;
    this.actionSelected = this.getActionByName(action);
    if (action == 'SampleCollections') {
      this.props.treeState.sampleCollection(this.nodeRightClicked);
    } else if (this.nodeRightClicked) {
      if (this.actionSelected && this.actionSelected.view && this.actionSelected.view == 'details') {
        this.showDetailsView(this.nodeRightClicked, action);
      } else {
        this.props.store.addNewEditorForTreeAction(this.nodeRightClicked, action);
      }
    }
  };

  showDetailsView = (treeNode, action) => {
    runInAction('Using active editor for tree details action', () => {
      this.props.store.treeActionPanel.treeNode = treeNode;
      this.props.store.treeActionPanel.treeAction = action;
      const editorId = this.props.store.editorPanel.activeEditorId;
      if (editorId) {
        this.props.store.detailsPanel.activeEditorId = editorId;
        const editor = this.props.store.editors.get(
          editorId
        );
        this.props.store.editors.set(editorId, {
          ...editor,
          detailsView: {visible: true, treeNode, treeAction: action}
        });
      }
    });
  }

  nodeRightClicked;
  actionSelected;

  renderContextMenu() {
    return this.getContextMenu();
  }

  render() {
    const classNames = `${Classes.ELEVATION_0} ${Classes.DARK}`;
    return (
      <div className={'sb-tree-view'} >
        <Tree
          contents={this.state.nodes}
          onNodeClick={this.handleNodeClick}
          onNodeCollapse={this.handleNodeCollapse}
          onNodeExpand={this.handleNodeExpand}
          onNodeContextMenu={this.handleNodeContextMenu}
          className={classNames}
        />
      </div>
    );
  }
}

TreeView.propTypes = {
  treeState: React.PropTypes.instanceOf(TreeState)
};
