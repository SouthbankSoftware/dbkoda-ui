/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-08T11:56:51+11:00
* @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-03-22T16:16:24+11:00
*/

import { observable, action } from 'mobx';

import TreeNode from './TreeNode.jsx';

export default class TreeState {
  nodes;
  @observable filter = '';
  treeJson;
  constructor() {
    this.nodes = observable([]);
  }
  @action setFilter(value) {
    this.filter = value.toLowerCase();
    this.filterNodes();
  }
  filterNodes() {
    this.nodes.clear();
    for (const node of this.treeJson) {
      const treeNode = new TreeNode(node, this.filter);
      if (treeNode.childNodes && treeNode.childNodes.length > 0) {
        this.nodes.push(treeNode);
      }
    }
  }
  parseJson(treeJson) {
    this.treeJson = treeJson;
    this.filterNodes();
  }

  selectNode(nodeData) {
    const originallySelected = nodeData.isSelected;
    this.forEachNode(this.nodes, (n) => { n.isSelected = false; });
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
