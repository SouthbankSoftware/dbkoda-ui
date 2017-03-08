/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-08T11:56:51+11:00
* @Email:  wahaj@southbanksoftware.com
* @Last modified by:   wahaj
* @Last modified time: 2017-03-08T16:50:56+11:00
*/

import { observable } from 'mobx';

import TreeNode from './TreeNode.js';

export default class TreeState {
  nodes;
  constructor() {
    this.nodes = observable([]);
  }

  parseJson(jsonString) {
    const treeJson = JSON.parse(jsonString);
    this.nodes.clear();
    for (const node of treeJson) {
      this.nodes.push(new TreeNode(node));
    }
  }

  getTopology() {
    return this.nodes;
  }
}
