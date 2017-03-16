/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-08T11:56:51+11:00
* @Email:  wahaj@southbanksoftware.com
* @Last modified by:   wahaj
* @Last modified time: 2017-03-15T17:34:12+11:00
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

  constructor(treeNode, parentId, filter) {
    this.type = TreeNode.getNodeType(treeNode);
    this.iconName = `tree-${this.type}`;
    if (parentId && parentId != 'root') {
      this.id = `${parentId}_${treeNode.text}`;
    } else {
      this.id = `${this.type}_${parentId}`;
    }
    if (filter != '') {
      this.isExpanded = true;
    }
    this.label = <DragLabel label={treeNode.text} id={this.id} type={this.type} filter={filter} />;
    if (treeNode.children) {
      this.childNodes = observable([]);
      for (const childnode of treeNode.children) {
        const child = new TreeNode(childnode, this.id, filter);
        if (filter == '') {
          this.childNodes.push(child);
        } else if (childnode.text.toLowerCase().indexOf(filter) >= 0) {
          this.childNodes.push(child);
        } else if (childnode.children && childnode.children.length > 0) {
          if (child.childNodes && child.childNodes.length > 0) {
            this.childNodes.push(child);
          }
        }
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
