/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-08T11:56:51+11:00
* @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-26T15:37:06+10:00
*/

import React from 'react';
import {observable} from 'mobx';

import DragLabel from './DragLabel.jsx';
import DatabaseIcon from '../../../styles/icons/database-icon-2.svg';
import DatabasesIcon from '../../../styles/icons/database-icon-3.svg';
import CollectionIcon from '../../../styles/icons/collection-icon.svg';
import IndexIcon from '../../../styles/icons/index-icon.svg';
import UsersIcon from '../../../styles/icons/users-icon-3.svg';
import UserIcon from '../../../styles/icons/user-icon.svg';
import RootShardsIcon from '../../../styles/icons/shards-icon-3.svg';
import ShardsIcon from '../../../styles/icons/shards-icon-2.svg';
import ShardIcon from '../../../styles/icons/shards-icon-1.svg';
import ConfigServersIcon from '../../../styles/icons/config-database-icon-3.svg';
import ConfigIcon from '../../../styles/icons/config-database-icon-1.svg';
import RoutersIcon from '../../../styles/icons/fix-icon.svg';
import MongosIcon from '../../../styles/icons/mongos-icon.svg';
import PropertiesIcon from '../../../styles/icons/attribute-icon.svg';
import PropertyIcon from '../../../styles/icons/attributes-icon.svg';
import ReplicaSetIcon from '../../../styles/icons/replica-set-icon.svg';
import ReplicaMemberIcon from '../../../styles/icons/replica-set-icon.svg';


export default class TreeNode {
  id;
  @observable label;
  text;
  type;
  iconName;
  secondaryLabel;
  allChildNodes;
  childNodes;
  @observable isSelected = false;
  @observable isExpanded = false;
  isFiltered = false;
  refParent;
  json;
  /**
   * Traverse a single dependency tree (DFS)
   *
   * @param {Object} treeJSON - JSON object from controller having text
   * @param {Object} parent - reference to the parent node
   */
  constructor(treeJSON, parent) {
    this.type = TreeNode.getNodeType(treeJSON, parent);
    if (this.type == 'root') {
      this.type = 'shards';
    }
    console.log(this.type);
    // Add label as secondaryLabel component.
    switch (this.type) {
      case 'shards':
        this.secondaryLabel = <RootShardsIcon className="dbEnvySVG shardsIcon" width={30} height={30} />;
      break;
      case 'group_shards':
        this.secondaryLabel = <ShardsIcon className="dbEnvySVG shardsIcon" width={30} height={30} />;
      break;
      case 'shard':
        this.secondaryLabel = <ShardIcon className="dbEnvySVG shardIcon" width={30} height={30} />;
      break;
      case 'configservers':
        this.secondaryLabel = <ConfigServersIcon className="dbEnvySVG configServersIcon" width={30} height={30} />;
      break;
      case 'config':
        this.secondaryLabel = <ConfigIcon className="dbEnvySVG configIcon" width={30} height={30} />;
      break;
      case 'routers':
        this.secondaryLabel = <RoutersIcon className="dbEnvySVG routersIcon" width={30} height={30} />;
      break;
      case 'mongos':
        this.secondaryLabel = <MongosIcon className="dbEnvySVG mongosIcon" width={30} height={30} />;
      break;
      case 'databases':
        this.secondaryLabel = <DatabasesIcon className="dbEnvySVG databasesIcon" width={30} height={30} />;
      break;
      case 'database':
        this.secondaryLabel = <DatabaseIcon className="dbEnvySVG databaseIcon" width={30} height={30} />;
      break;
      case 'collection':
        this.secondaryLabel = <CollectionIcon className="dbEnvySVG collectionIcon" width={30} height={30} />;
      break;
      case 'index':
        this.secondaryLabel = <IndexIcon className="dbEnvySVG indexIcon" width={30} height={30} />;
      break;
      case 'users':
        this.secondaryLabel = <UsersIcon className="dbEnvySVG usersIcon" width={30} height={30} />;
      break;
      case 'user':
        this.secondaryLabel = <UserIcon className="dbEnvySVG userIcon" width={30} height={30} />;
      break;
      case 'property':
        this.secondaryLabel = <PropertyIcon className="dbEnvySVG propertyIcon" width={30} height={30} />;
      break;
      case 'properties':
        this.secondaryLabel = <PropertiesIcon className="dbEnvySVG propertiesIcon" width={30} height={30} />;
      break;
      case 'replicaset':
        this.secondaryLabel = <ReplicaSetIcon className="dbEnvySVG replicaSetIcon" width={30} height={30} />;
      break;
      case 'replica_member':
        this.secondaryLabel = <ReplicaMemberIcon className="dbEnvySVG replicaMemberIcon" width={30} height={30} />;
      break;
      default:
      this.secondaryLabel = null;
      break;
    }
    // this.iconName = `pt-icon-${this.type}`;
    this.iconName = null;
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
      parent
        .allChildNodes
        .set(this.id, this);
    } else if (parent && parent.allChildNodes) {
      parent
        .allChildNodes
        .set(this.id, this);
    }
    this.text = treeJSON.text;
    this.json = treeJSON;
    this.label = <DragLabel label={this.text} id={this.id} type={this.type} refParent={this.refParent} />;
    if (treeJSON.children) {
      this.allChildNodes = new Map();
      for (const childJSON of treeJSON.children) {
        const child = new TreeNode(childJSON, this);
        this
          .allChildNodes
          .set(child.id, child);
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
        if (filter == '' || this.isFiltered) {
          // add the child nodes if there is no filter
          this
            .childNodes
            .push(child);
        } else if (child.text.toLowerCase().indexOf(filter) >= 0) {
          // add the child node if filtered text is found in the child node label
          this
            .childNodes
            .push(child);
        } else if (child.allChildNodes && child.allChildNodes.size > 0) { // add the child node if the grand child has filtered text in the label
          if (child.childNodes && child.childNodes.length > 0) {
            // Check if there are childNodes existing
            this
              .childNodes
              .push(child);
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
      return 'group_' + parent
        .id
        .split('_')[1];
    }
    return treeJSON
      .text
      .toLowerCase()
      .replace(' ', '');
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
        objState
          .allChildNodes
          .push(child.StateObject);
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
        this
          .allChildNodes
          .get(child.id)
          .StateObject = child;
      }
    }
  }
}
