/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-08T11:56:51+11:00
* @Email:  wahaj@southbanksoftware.com
* @Last modified by:   wahaj
* @Last modified time: 2017-03-15T11:33:35+11:00
*/

import React from 'react';


import { observable } from 'mobx';

import { ITreeNode } from '@blueprintjs/core';

import DragLabel from './DragLabel.jsx';

export default class TreeNode implements ITreeNode {
  id;
  @observable label;
  type;
  iconName;
  @observable childNodes;
  @observable isSelected = false;
  @observable isExpanded = false;

  constructor(treeNode, parentId) {
    this.type = TreeNode.getNodeType(treeNode);
    this.iconName = `tree-${this.type}`;
    if (parentId) {
      this.id = `${parentId}_${treeNode.text}`;
    } else {
      this.id = this.type + '_parent';
    }
    this.label = <DragLabel label={treeNode.text} id={this.id} type={this.type} />;
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
