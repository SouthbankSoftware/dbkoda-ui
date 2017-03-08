/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-07T11:39:01+11:00
* @Email:  wahaj@southbanksoftware.com
* @Last modified by:   wahaj
* @Last modified time: 2017-03-08T17:01:16+11:00
*/

import React from 'react';
import {inject, observer} from 'mobx-react';

import { Classes, ITreeNode, Tooltip, Tree } from '@blueprintjs/core';

@inject('treeState')
@observer
export default class TreeView extends React.Component {
  render() {
    console.log(this.props);
    return (
      <div>
        <h1>TreeView</h1>
        <Tree
          contents={this.props.treeState.nodes}
          onNodeClick={this.handleNodeClick}
          onNodeCollapse={this.handleNodeCollapse}
          onNodeExpand={this.handleNodeExpand}
          className={Classes.ELEVATION_0}
        />
      </div>
    );
  }
  handleNodeClick = (
    nodeData: ITreeNode,
    _nodePath: number[],
    e: React.MouseEvent<HTMLElement>,
  ) => {
    const originallySelected = nodeData.isSelected;
    if (!e.shiftKey) {
      this.forEachNode(this.state.nodes, (n) => { n.isSelected = false; });
    }
    nodeData.isSelected = originallySelected == null ? true : !originallySelected;
    this.setState(this.state);
  };

  handleNodeCollapse = (nodeData: ITreeNode) => {
    nodeData.isExpanded = false;
    this.setState(this.state);
  };

  handleNodeExpand = (nodeData: ITreeNode) => {
    nodeData.isExpanded = true;
    this.setState(this.state);
  };

  forEachNode(nodes: ITreeNode[], callback: (node: ITreeNode) => void) {
    if (nodes == null) {
      return;
    }

    for (const node of nodes) {
      callback(node);
      this.forEachNode(node.childNodes, callback);
    }
  }
}
