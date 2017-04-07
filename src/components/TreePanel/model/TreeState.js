/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-08T11:56:51+11:00
* @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-07T08:35:01+10:00
*/

import { observable, action } from 'mobx';

import TreeNode from './TreeNode.jsx';

export default class TreeState {
  treeNodes;
  @observable filteredNodes;
  @observable filter = '';
  @observable isJsonParsed = false;
  treeJson;
  treeRoot; // required for make root node functionality
  previousState; // last state before we have changed the root node.
  resetTreeNode;
  @observable profileAlias = '';
  constructor() {
    this.treeNodes = [];
    this.filteredNodes = observable([]);
    this.resetTreeNode = new TreeNode({ text: '...' });
  }
  /**
   * set the selected profile alias to be shown in toolbar
   * @param {string}  - text of profile alias
   */
  @action setProfileAlias(value) {
    this.profileAlias = value;
  }
  /**
   * Set the filter value for the tree nodes and executes the function to filter treeNodes.
   * @param {string}  - text to filter and highlight
   */
  @action setFilter(value) {
    this.filter = value.toLowerCase();
    this.filterNodes();
  }
  /**
   * Function to perform the filter action on the treeNodes.
   */
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
    this.isJsonParsed = false;
    this.treeJson = treeJson;
    this.treeRoot = undefined;
    this.filteredNodes.clear();
    if (this.treeJson.length && this.treeJson.length > 0) {
      this.treeNodes = [];
      for (const node of this.treeJson) {
        const treeNode = new TreeNode(node);
        if (treeNode.allChildNodes && treeNode.allChildNodes.size > 0) {
          this.treeNodes.push(treeNode);
        }
      }
      this.filterNodes();
      this.isJsonParsed = true;
    }
  }
  /**
   * function to select a specific node in a tree
   * @param  {TreeNode} nodeData treeNode which has been clicked by the userPreferences
   */
  selectNode(nodeData) {
    // const originallySelected = nodeData.isSelected;
    this.forEachNode(this.nodes, (n) => {
      n.isSelected = false;
    });
    nodeData.isSelected = true; // originallySelected == null ? true : !originallySelected;
  }
  /**
   * Set the root node of the tree
   * @param  {treeNode} nodeData treeNode which has been selected by the user
   */
  selectRootNode(nodeData) {
    this.preserveState();
    this.treeRoot = nodeData;
    this.filterNodes();
  }
  /**
   * Reset the root node to display the complete topology of the selected profile
   */
  resetRootNode() {
    this.treeRoot = undefined;
    this.filterNodes();
    this.restoreState();
  }
  /**
   * Save the state of tree for future restoration
   */
  preserveState() {
    this.previousState = new Map();
    for (const child of this.treeNodes) {
      this.previousState.set(child.id, child.StateObject);
    }
  }
  /**
   * Restores the tree state to a previous state
   * @return {[type]} [description]
   */
  restoreState() {
    if (this.previousState && this.previousState.size > 0) {
      for (const child of this.treeNodes) {
        const lastState = this.previousState.get(child.id);
        child.StateObject = lastState;
      }
    }
  }
  /**
   * Returns the tree nodes to bind to react tree component
   * @return {[type]} [description]
   */
  get nodes() {
    return this.filteredNodes;
  }
  /**
   * Function to iterate all the nodes of a treeState
   * @param  {ITreeNode[]}   nodes    - Nodes array/map to parse
   * @param  {Function} callback - Callback method to execute on each node
   */
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
