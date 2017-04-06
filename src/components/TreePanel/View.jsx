/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-07T11:39:01+11:00
* @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-06T18:23:53+10:00
*/

import React from 'react';
import {inject} from 'mobx-react';
import { reaction, observe } from 'mobx';
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
      treeState: undefined
    };
  }
  constructor(props) {
    super(props);

    this.state = {nodes: this.props.treeState.nodes};

    reaction(() => this.props.treeState.isFiltered, () => {
      this.setState({nodes: this.props.treeState.nodes});
    });
    reaction(() => this.props.treeState.filter, () => {
      this.setState({nodes: this.props.treeState.nodes});
    });
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
    console.log('clicked:', action);
    if (this.nodeRightClicked) {
      console.log('test global store', this.props.store);
      // this.props.treeState.executeTreeAction(this.nodeRightClicked, action);
    }
  };


  nodeRightClicked;

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
