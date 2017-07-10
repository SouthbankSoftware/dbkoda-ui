/*
 * dbKoda - a modern, open source code editor, for MongoDB.
 * Copyright (C) 2017-2018 Southbank Software
 *
 * This file is part of dbKoda.
 *
 * dbKoda is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * dbKoda is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-03-08T11:56:51+11:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-06-07T09:59:09+10:00
 */

/* eslint-disable */

import {
  observable,
  action
} from 'mobx';
import _ from 'lodash';
import {
  featherClient
} from '~/helpers/feathers';
import {
  NewToaster
} from '#/common/Toaster';
import {
  Intent
} from '@blueprintjs/core';
import EventLogging from '#/common/logging/EventLogging';
import TreeNode from './TreeNode.jsx';

export default class TreeState {
  profileId;
  topologyProfileId = '';
  treeNodes;
  @observable filteredNodes;
  @observable filter = '';
  @observable isNewJsonAvailable = false;
  treeJson;
  treeRoot; // required for make root node functionality
  previousState; // last state before we have changed the root node.
  resetTreeNode;
  @observable profileAlias = '';
  updateCallback;
  updateCallback2;
  constructor() {
    this.treeNodes = [];
    this.filteredNodes = observable([]);
    this.resetTreeNode = new TreeNode({
      text: '...'
    });
  }
  @action setProfileId(value) {
    this.profileId = value;
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
  @action filterNodes() {
    this
      .filteredNodes
      .clear();
    if (this.treeRoot) {
      this
        .filteredNodes
        .push(this.resetTreeNode);
      this
        .treeRoot
        .setFilter(this.filter);
      this.treeRoot.isExpanded = true;
      this
        .filteredNodes
        .push(this.treeRoot);
    } else {
      for (const treeNode of this.treeNodes) {
        treeNode.setFilter(this.filter);
        if (treeNode.childNodes) {
          this
            .filteredNodes
            .push(treeNode);
        }
      }
    }
  }
  /**
   * function to parse json document from the controller
   * @param  {json} treeJson [description]
   */
  @action parseJson(treeJson, profileId = '') {
    this.treeJson = treeJson;
    this.treeRoot = undefined;
    if (profileId != '' && profileId == this.topologyProfileId) {
      this.preserveState();
    }
    this
      .filteredNodes
      .clear();
    if (this.treeJson.length && this.treeJson.length > 0) {
      this.treeNodes = [];
      for (const node of this.treeJson) {
        const treeNode = new TreeNode(node);
        if (treeNode.allChildNodes && treeNode.allChildNodes.size > 0) {
          this
            .treeNodes
            .push(treeNode);
        } else if (treeNode.type && treeNode.type == 'users') {
          this
            .treeNodes
            .push(treeNode);
        }
      }
      console.log('TEST: ', this.treeNodes);
      this.filterNodes();
      this.isNewJsonAvailable = true;
    }
    if (profileId != '' && profileId == this.topologyProfileId) {
      this.restoreState();
    }
    this.topologyProfileId = profileId;
  }
  /**
   * function to select a specific node in a tree
   * @param  {TreeNode} nodeData treeNode which has been clicked by the userPreferences
   */
  @action selectNode(nodeData) {
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
  @action selectRootNode(nodeData) {
    this.preserveState();
    this.treeRoot = nodeData;
    this.filterNodes();
  }
  /**
   * Reset the root node to display the complete topology of the selected profile
   */
  @action resetRootNode() {
    this.treeRoot = undefined;
    this.filterNodes();
    this.restoreState();
  }
  /**
   * Save the state of tree for future restoration
   */
  @action preserveState() {
    this.previousState = new Map();
    for (const child of this.treeNodes) {
      this
        .previousState
        .set(child.id, child.StateObject);
    }
  }
  /**
   * Restores the tree state to a previous state
   * @return {[type]} [description]
   */
  @action restoreState() {
    if (this.previousState && this.previousState.size > 0) {
      for (const child of this.treeNodes) {
        const lastState = this
          .previousState
          .get(child.id);
        child.StateObject = lastState;
      }
    }
  }
  /**
   * Updates the tree state to show collection information.
   * @param {Object} nodeRightClicked - The Node that triggered this action.
   */
  sampleCollection(nodeRightClicked) {
    const db = nodeRightClicked.refParent.text;
    const queryFirst = 'use ' + db + '\n'; // eslint-disable-line
    const querySecond = 'db.' + nodeRightClicked.text + '.find().limit(20).toArray()'; //
    const profile = this.updateCallback2();
    console.log('Prof: ', profile);
    if (profile.shellVersion) {
      if (profile.shellVersion.match(/^3.0.*/gi) ||
        profile.shellVersion.match(/^2.*/gi) ||
        profile.shellVersion.match(/^1.*/gi)) {
        console.log('Sample attributes does not currently support Shell versions lower than 3.1, detected version is: ', profile.shellVersion);
         NewToaster.show({
          message: 'Sorry, sampling of collection not currently supported for Mongo shell versions lower than 3.1',
          intent: Intent.DANGER,
          iconName: 'pt-icon-thumbs-down'
        });
      } else {
        const service = featherClient().service('/tree-actions');
        service.timeout = 30000;
        service.get(profile.id, {query:{type:'attributes', db, collection: nodeRightClicked.text}})
          .then((res) => {
              this
                .parseSampleData(res)
                .then((sampleJSON) => {
                    if (!nodeRightClicked.allChildNodes) {
                      nodeRightClicked.allChildNodes = new Map();
                    }
                    const child = new TreeNode(sampleJSON, nodeRightClicked);
                    nodeRightClicked.isExpanded = true;
                    child.isExpanded = true;
                    nodeRightClicked.setFilter(this.filter);
                    this.updateCallback();
                    nodeRightClicked.isExpanded = true;
                    this.updateCallback();
                  },
                  (err) => {
                    console.log('Failed: ', err);
                  });
            },
            (err) => {
              console.log('Failed: ', err);
            });
      }
    } else {
         console.log('Sample Attributes could not determine the shell version, detected version is: ', profile.shellVersion);
         NewToaster.show({
          message: 'Sorry, sampling of collections failed as we can not detect a supported Mongo Shell Version',
          intent: Intent.DANGER,
          iconName: 'pt-icon-thumbs-down'
        });
    }
  }

  /**
   * Parse sample data from shell and create a tree sample structure.
   * @param {Object[]} queryResult - An array of JSON objects from the collection.
   * @return {Object} - The resulting tree structure.
   */
  parseSampleData(queryResult) {
    return new Promise((resolve, reject) => {
      // Create an object as a union of all attributes. Remove db swap. Replace
      // ObjectID(...) elements.
      try {
        console.log('Q R: ', queryResult);
        let object = queryResult;
        //Build tree from JSON object.
        let treeObj = {
          text: 'Attributes',
          type: 'properties',
          children: []
        };
        this.traverseObject(object, treeObj.children);
        console.log('Tree Object: ', treeObj);

        //console.log(keys);
        resolve(treeObj);
      } catch (err) {
        NewToaster.show({
          message: 'Sorry, sampling of collection failed! Please try again.',
          intent: Intent.DANGER,
          iconName: 'pt-icon-thumbs-down'
        });
        reject('Sampling of Attributes Failed: ', err);
      }
    });
  }

  traverseObject(obj, childArray) {
    if (obj) {
      Object
        .keys(obj)
        .forEach(function (key) {
          if (typeof obj[key] === 'object') {
            console.log('Parsing: ', obj[key]);
            if (Array.isArray(obj[key])) {
              //Array
              console.log('Object is Array');
              let newChild = {
                text: key + ' (array)',
                type: 'properties',
                children: []
              };
              this.traverseObject(obj[key][0], newChild.children);
              childArray.push(newChild);
            } else {
              //Object
              console.log('Object is Object');
              let newChild = {
                text: key,
                type: 'properties',
                children: []
              };
              this.traverseObject(obj[key], newChild.children);
              childArray.push(newChild);
            }

          } else {
            console.log('Object is Property');
            childArray.push({
              text: key,
              type: 'property'
            });;
          }
          // Create a node

        }.bind(this));
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

  getDummyResult() {
    return [{

      'name': 'd',
      'age': '1',
      'nested': {
        'a': 1,
        'b': {
          'bb': 1,
          'bbb': 2
        }
      }
    }, {

      'name': 'g',
      'age': '1',
      'nested': {
        'a': 1,
        'b': {
          'bb': 1,
          'bbb': 2
        }
      }
    }, {

      'name': 'a',
      'age': '1',
      'nested': {
        'a': 1,
        'b': {
          'bb': 1,
          'bbb': 2
        }
      }
    }, {

      'name': 'k',
      'age': '1',
      'nested': {
        'a': 1,
        'b': {
          'bb': 1,
          'bbb': 2
        }
      }
    }, {

      'name': 'l',
      'age': '1',
      'nested': {
        'a': 1,
        'b': {
          'bb': 1,
          'bbb': 2
        }
      }
    }, {

      'name': 'm',
      'age': '1',
      'nested': {
        'a': 1,
        'b': {
          'bb': 1,
          'bbb': 2
        }
      }
    }, {

      'name': 'b',
      'age': '1',
      'nested': {
        'a': 1,
        'b': {
          'bb': 1,
          'bbb': 2
        }
      }
    }, {

      'name': 'c',
      'age': '1',
      'nested': {
        'a': 1,
        'b': {
          'bb': 1,
          'bbb': 2
        }
      }
    }, {

      'name': 'h',
      'age': '1',
      'nested': {
        'a': 1,
        'b': {
          'bb': 1,
          'bbb': 2
        }
      }
    }, {

      'name': 'f',
      'age': '1',
      'nested': {
        'a': 1,
        'b': {
          'bb': 1,
          'bbb': 2
        }
      }
    }, {
      'name': 'e',
      'age': '1',
      'height': 123,
      'nested': {
        'a': 1,
        'b': {
          'bb': 1,
          'bbb': 2
        }
      }
    }, {

      'name': 'j',
      'age': '1',
      'nested': {
        'a': 1,
        'b': {
          'bb': 1,
          'bbb': 2
        }
      }
    }, {
      'name': 'e',
      'age': '1',
      'nested': {
        'a': 1,
        'b': {
          'bb': 1,
          'bbb': 2,
          'ccc': 3
        }
      }
    }, {
      'name': 'e',
      'age': '1',
      'nested': {
        'a': 1,
        'b': {
          'bb': 1,
          'bbb': 2
        }
      }
    }];
  }
}
