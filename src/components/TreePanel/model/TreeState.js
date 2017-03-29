/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-08T11:56:51+11:00
* @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-03-29T16:13:57+11:00
*/

import { observable, action } from 'mobx';

import TreeNode from './TreeNode.jsx';

export default class TreeState {
  treeNodes;
  @observable filteredNodes;
  @observable filter = '';
  treeJson;
  treeRoot; // required for make root node functionality
  resetTreeNode;
  @observable profileAlias = '';
  constructor() {
    this.treeNodes = [];
    this.filteredNodes = observable([]);
    this.resetTreeNode = new TreeNode({ text: '...' });
  }
  @action setProfileAlias(value) {
    this.profileAlias = value;
  }
  @action setFilter(value) {
    this.filter = value.toLowerCase();
    this.filterNodes();
  }
  filterNodes() {
    this.filteredNodes.clear();
    if (this.treeRoot) {
      this.filteredNodes.push(this.resetTreeNode);
      this.treeRoot.setFilter(this.filter);
      this.treeRoot.isExpanded = true;
      this.filteredNodes.push(this.treeRoot);
    } else {
      for (const treeNode of this.treeNodes) {
        treeNode.setFilter(this.filter);
        if (treeNode.childNodes && treeNode.childNodes.length > 0) {
          this.filteredNodes.push(treeNode);
        }
      }
    }
  }
  /**
   * function to parse json document from the controller
   * @param  {json} treeJson [description]
   */
  parseJson(treeJson) {
    this.treeJson = treeJson;
    if (this.treeJson.length && this.treeJson.length > 0) {
      this.treeNodes = [];
      for (const node of this.treeJson) {
        const treeNode = new TreeNode(node);
        if (treeNode.allChildNodes && treeNode.allChildNodes.length > 0) {
          this.treeNodes.push(treeNode);
        }
      }
      this.filterNodes();
    }
  }
  /**
   * function to select a specific node in a tree
   * @param  {TreeNode} nodeData treeNode which has been clicked by the userPreferences
   */
  selectNode(nodeData) {
    const originallySelected = nodeData.isSelected;
    this.forEachNode(this.nodes, (n) => {
      n.isSelected = false;
    });
    nodeData.isSelected = originallySelected == null ? true : !originallySelected;
  }
  selectRootNode(nodeData) {
    this.treeRoot = nodeData;
    this.filterNodes();
  }
  resetRootNode() {
    this.treeRoot = undefined;
    this.filterNodes();
  }
  get nodes() {
    return this.filteredNodes;
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
