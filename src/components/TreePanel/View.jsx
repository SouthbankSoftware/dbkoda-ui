/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-07T11:39:01+11:00
* @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-03-22T16:16:51+11:00
*/

import React from 'react';
import {inject, observer} from 'mobx-react';
import { Classes, ITreeNode, Tree } from '@blueprintjs/core';

import TreeState from './model/TreeState.js';
import './View.scss';

@inject('treeState')
@observer
export default class TreeView extends React.Component {
  static get defaultProps() {
    return {
      treeState: undefined
    };
  }
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
