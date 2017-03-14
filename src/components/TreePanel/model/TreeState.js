/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-08T11:56:51+11:00
* @Email:  wahaj@southbanksoftware.com
* @Last modified by:   wahaj
* @Last modified time: 2017-03-14T15:58:15+11:00
*/

import { observable } from 'mobx';

import TreeNode from './TreeNode.js';

export default class TreeState {
  nodes;
  constructor() {
    this.nodes = observable([]);
  }

  parseJson(treeJson) {
    this.nodes.clear();
    for (const node of treeJson) {
      this.nodes.push(new TreeNode(node));
    }
  }

  selectNode(nodeData, e) {
    const originallySelected = nodeData.isSelected;
    if (!e.shiftKey) {
      this.forEachNode(this.nodes, (n) => { n.isSelected = false; });
    }
    nodeData.isSelected = originallySelected == null ? true : !originallySelected;
  }

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
