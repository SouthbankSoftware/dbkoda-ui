/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-08T11:56:51+11:00
* @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-03T12:39:14+10:00
*/

import React from 'react';
import { observable } from 'mobx';
import { ITreeNode } from '@blueprintjs/core';

import DragLabel from './DragLabel.jsx';

export default class TreeNode implements ITreeNode {
  id;
  @observable label;
  text;
  type;
  iconName;
  allChildNodes;
  childNodes;
  @observable isSelected = false;
  @observable isExpanded = false;
  isFiltered = false;
  refParent;
  /**
   * Traverse a single dependency tree (DFS)
   *
   * @param {Object} treeJSON - JSON object from controller having text
   * @param {Object} parent - reference to the parent node
   */
  constructor(treeJSON, parent) {
    this.type = TreeNode.getNodeType(treeJSON, parent);
    this.iconName = `pt-icon-${this.type}`;
    if (parent && parent.id != 'root') {
      this.id = `${parent.id}_${treeJSON.text}`;
    } else {
      this.id = `root_${this.type}`;
    }
    if (parent) {
      this.refParent = parent;
    }
    if (parent && !parent.allChildNodes) {
      parent.allChildNodes = new Map();
      parent.allChildNodes.set(this.id, this);
      console.log('Test - Tree Add');
    } else if (parent && parent.allChildNodes) {
      parent.allChildNodes.set(this.id, this);
      console.log('Test - Tree Add 2');
    }
    this.text = treeJSON.text;
    this.label = <DragLabel label={this.text} id={this.id} type={this.type} refParent={this.refParent} filter={this.filter} />;
    if (treeJSON.children) {
      this.allChildNodes = new Map();
      for (const childJSON of treeJSON.children) {
        const child = new TreeNode(childJSON, this);
        this.allChildNodes.set(child.id, child);
      }
    }
  }
  /**
   * Traverse a single dependency tree (DFS)
   *
   * @param {Object} filter - string value to find in the text label of each node.
   * @param {Object} parent - reference to the parent node
   */
  setFilter(filter, parent) {
    this.isFiltered = false;
    this.isExpanded = false;
    this.childNodes = undefined;
    if (this.text.toLowerCase().indexOf(filter) >= 0 || (parent && parent.isFiltered)) {
      this.isFiltered = true;
    }
    if (filter != '' && !this.isFiltered) {
      this.isExpanded = true;
    }
    if (this.allChildNodes) {
      this.childNodes = [];
      for (const child of this.allChildNodes.values()) {
        child.setFilter(filter, this);
        if (filter == '' || this.isFiltered) {                             // add the child nodes if there is no filter
          this.childNodes.push(child);
        } else if (child.text.toLowerCase().indexOf(filter) >= 0) {     // add the child node if filtered text is found in the child node label
          this.childNodes.push(child);
        } else if (child.allChildNodes && child.allChildNodes.size > 0) {   // add the child node if the grand child has filtered text in the label
          if (child.childNodes && child.childNodes.length > 0) {              // Check if there are childNodes existing
            this.childNodes.push(child);
          }
        }
      }
    }
  }
/**
 * Returns the node type based on the node text or json specified node type
 *
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

  /**
   * Returns the current tree node state to restore to it after a temporary change (used for SetTreeRoot functionality)
   */
  get StateObject() {
    const objState = {};
    objState.isFiltered = (this.isFiltered || false);
    objState.isExpanded = (this.isExpanded || false);
    objState.isSelected = (this.isSelected || false);
    objState.id = this.id;
    objState.allChildNodes = [];
    if (this.allChildNodes) {
      for (const child of this.allChildNodes.values()) {
        objState.allChildNodes.push(child.StateObject);
      }
    }
    return objState;
  }
  /**
   * Set the current node to a previously saved state
   * @param {Object} objState - JSON Object representing the treeNode state
   */
  set StateObject(objState) {
    this.isFiltered = objState.isFiltered;
    this.isExpanded = objState.isExpanded;
    this.isSelected = objState.isSelected;
    if (objState.allChildNodes.length > 0) {
      for (const child of objState.allChildNodes) {
        this.allChildNodes.get(child.id).StateObject = child;
      }
    }
  }
}
