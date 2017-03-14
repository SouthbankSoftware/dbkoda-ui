/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-07T11:39:01+11:00
* @Email:  wahaj@southbanksoftware.com
* @Last modified by:   wahaj
* @Last modified time: 2017-03-14T16:45:42+11:00
*/

import React from 'react';
import {inject, observer} from 'mobx-react';

import { Classes, ITreeNode, Tooltip, Tree } from '@blueprintjs/core';

import './View.scss';

@inject('treeState')
@observer
export default class TreeView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {nodes: this.props.treeState.nodes};
  }

  componentWillReceiveProps(nextProps) {
    this.setState({nodes: nextProps.treeState.nodes});
  }

  handleNodeClick = (
    nodeData: ITreeNode,
    _nodePath: number[],
    e: React.MouseEvent<HTMLElement>,
  ) => {
    this.props.treeState.selectNode(nodeData, e);
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
