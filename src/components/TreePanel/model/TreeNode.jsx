/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-08T11:56:51+11:00
* @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-03-20T16:18:56+11:00
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
  isFiltered = false;
  refParent;
  /**
   * Traverse a single dependency tree (DFS)
   *
   * @param {Object} treeJSON - JSON object from controller having text
   * @param {string} filter - any string set by the user in searchbar for highlighting purpose
   * @param {Object} parent - reference to the parent node
   */
  constructor(treeJSON, filter, parent) {
    this.type = TreeNode.getNodeType(treeJSON, parent);
    console.log(this.type);
    this.iconName = `tree-${this.type}`;
    if (parent && parent.id != 'root') {
      this.id = `${parent.id}_${treeJSON.text}`;
    } else {
      this.id = `root_${this.type}`;
    }
    if (parent) {
      this.refParent = parent;
    }
    if (treeJSON.text.toLowerCase().indexOf(filter) >= 0 || (parent && parent.isFiltered)) {
      this.isFiltered = true;
    }
    if (filter != '' && !this.isFiltered) {
      this.isExpanded = true;
    }
    this.label = <DragLabel label={treeJSON.text} id={this.id} type={this.type} refParent={this.refParent} filter={filter} />;
    if (treeJSON.children) {
      this.childNodes = observable([]);
      for (const childJSON of treeJSON.children) {
        const child = new TreeNode(childJSON, filter, this);
        if (filter == '' || this.isFiltered) {                             // add the child nodes if there is no filter
          this.childNodes.push(child);
        } else if (childJSON.text.toLowerCase().indexOf(filter) >= 0) {     // add the child node if filtered text is found in the child node label
          this.childNodes.push(child);
        } else if (childJSON.children && childJSON.children.length > 0) {   // add the child node if the grand child has filtered text in the label
          if (child.childNodes && child.childNodes.length > 0) {              // Check if there are childNodes existing
            this.childNodes.push(child);
          }
        }
      }
    }
  }
/**
 * @param {Object} treeJSON - JSON object from controller having text
 * @return {string} - type of the node in mongodb
 */
  static getNodeType(treeJSON, parent) {
    if (treeJSON.type) {
      return treeJSON.type;
    }
    if (parent && parent.id != 'root') {
      return parent.id.split('_')[1];
    }
    return treeJSON.text.toLowerCase().replace(' ', '');
  }
}
