/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-08T11:56:51+11:00
* @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-03-27T16:13:00+11:00
*/

import { observable, action } from 'mobx';

import TreeNode from './TreeNode.jsx';

export default class TreeState {
  treeNodes;
  @observable filteredNodes;
  @observable filter = '';
  treeJson;
  treeRoot;                 // required for make root node functionality
  constructor() {
    this.treeNodes = observable([]);
    this.filteredNodes = observable([]);
  }
  @action setFilter(value) {
    this.filter = value.toLowerCase();
    this.filterNodes();
  }
  filterNodes() {
    this.filteredNodes.clear();
    for (const treeNode of this.treeNodes) {
      treeNode.setFilter(this.filter);
      if (treeNode.childNodes && treeNode.childNodes.length > 0) {
        this.filteredNodes.push(treeNode);
      }
    }
  }
  parseJson(treeJson) {
    this.treeJson = treeJson;
    for (const node of this.treeJson) {
      const treeNode = new TreeNode(node);
      if (treeNode.allChildNodes && treeNode.allChildNodes.length > 0) {
        this.treeNodes.push(treeNode);
      }
    }
    this.filterNodes();
  }

  selectNode(nodeData) {
    const originallySelected = nodeData.isSelected;
    this.forEachNode(this.nodes, (n) => { n.isSelected = false; });
    nodeData.isSelected = originallySelected == null ? true : !originallySelected;
  }
  get nodes() {
    return this.filteredNodes;
  }

  set nodes(value) {
    this.filteredNodes = value;
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
