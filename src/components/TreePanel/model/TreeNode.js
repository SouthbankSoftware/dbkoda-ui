/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-08T11:56:51+11:00
* @Email:  wahaj@southbanksoftware.com
* @Last modified by:   wahaj
* @Last modified time: 2017-03-14T16:01:50+11:00
*/

import { observable } from 'mobx';

import { ITreeNode } from '@blueprintjs/core';

export default class TreeNode implements ITreeNode {
  id;
  @observable label;
  type;
  iconName;
  @observable childNodes;
  @observable isSelected = false;
  @observable isExpanded = false;

  constructor(treeNode, parentTextAsId) {
    this.label = treeNode.text;
    this.type = TreeNode.getNodeType(treeNode);
    this.iconName = `tree-${this.type}`;
    if (parentTextAsId) {
      this.id = `${parentTextAsId}_${this.label}`;
    } else {
      this.id = this.type + '_parent';
    }
    if (treeNode.children) {
      this.childNodes = observable([]);
      for (const childnode of treeNode.children) {
        this.childNodes.push(new TreeNode(childnode, this.id));
      }
    }
  }

  static getNodeType(treeNode) {
    if (treeNode.type) {
      return treeNode.type;
    }
    return treeNode.text.toLowerCase().replace(' ', '');
  }
}
