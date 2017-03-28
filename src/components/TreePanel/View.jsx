/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-07T11:39:01+11:00
* @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-03-28T12:55:49+11:00
*/

import React from 'react';
import {inject} from 'mobx-react';
import { reaction } from 'mobx';
import { Classes, ITreeNode, Tree } from '@blueprintjs/core';

import TreeState from './model/TreeState.js';
import './View.scss';

@inject('treeState')
export default class TreeView extends React.Component {
  static get defaultProps() {
    return {
      treeState: undefined
    };
  }
  constructor(props) {
    super(props);

    this.state = {nodes: this.props.treeState.nodes};

    reaction(() => this.props.treeState.filter, () => {
      this.setState({nodes: this.props.treeState.nodes});
    });
  }

  handleNodeClick = (
    nodeData: ITreeNode,
    _nodePath: number[],
    e: React.MouseEvent<HTMLElement>,
  ) => {
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
  render() {
    const classNames = `${Classes.ELEVATION_0} ${Classes.DARK}`;
    return (
      <div className={'sb-tree-view'} >
        <Tree
          contents={this.state.nodes}
          onNodeClick={this.handleNodeClick}
          onNodeCollapse={this.handleNodeCollapse}
          onNodeExpand={this.handleNodeExpand}
          className={classNames}
        />
      </div>
    );
  }
}

TreeView.propTypes = {
  treeState: React.PropTypes.instanceOf(TreeState)
};
