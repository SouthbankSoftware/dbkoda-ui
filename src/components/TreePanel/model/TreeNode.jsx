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
 *
 *
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-03-08T11:56:51+11:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-05-18T11:22:32+10:00
 */

import React from 'react';
import { observable } from 'mobx';
import autobind from 'autobind-decorator';
import DragLabel from './DragLabel.jsx';

import DatabaseIcon from '../../../styles/icons/database-icon-2.svg';
import DatabasesIcon from '../../../styles/icons/database-icon-4.svg';
import CollectionIcon from '../../../styles/icons/collection-icon.svg';
import IndexIcon from '../../../styles/icons/index-icon.svg';
import UsersIcon from '../../../styles/icons/users-icon-4.svg';
import UserIcon from '../../../styles/icons/user-icon.svg';
import RolesIcon from '../../../styles/icons/users-icon-4.svg';
import RoleIcon from '../../../styles/icons/user-icon.svg';
import RootShardsIcon from '../../../styles/icons/shards-icon-4.svg';
import ShardsIcon from '../../../styles/icons/shards-icon-2.svg';
import ShardIcon from '../../../styles/icons/shards-icon-1.svg';
import ConfigServersIcon from '../../../styles/icons/config-database-icon-4.svg';
import ConfigIcon from '../../../styles/icons/config-database-icon-1.svg';
import RoutersIcon from '../../../styles/icons/mongos-icon-2.svg';
import MongosIcon from '../../../styles/icons/mongos-icon.svg';
import PropertiesIcon from '../../../styles/icons/attribute-icon.svg';
import PropertyIcon from '../../../styles/icons/attributes-icon.svg';
import ReplicaSetIcon from '../../../styles/icons/replica-set-icon-2.svg';
import ReplicaMemberIcon from '../../../styles/icons/replica-set-icon.svg';
import PrimaryIcon from '../../../styles/icons/primary-icon.svg';
import SecondaryIcon from '../../../styles/icons/secondary-icon.svg';
import ArbiterIcon from '../../../styles/icons/arbiters-icon.svg';

export default class TreeNode {
  id;
  @observable label;
  text;
  type;
  className;
  icon;
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
  constructor(treeJSON, parent, store) {
    this.store = store;
    this.type = TreeNode.getNodeType(treeJSON, parent);
    if (this.type == 'root') {
      this.type = 'shards';
    }
    // Add label as secondaryLabel component.
    this.secondaryLabel = this.getIconForSecondaryLabel(this.type);
    this.className = this.type + 'Node';
    // this.icon = `pt-icon-${this.type}`;
    this.icon = null;
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
    } else if (parent && parent.allChildNodes) {
      parent.allChildNodes.set(this.id, this);
    }
    this.text = treeJSON.text;
    if (!this.text) {
      this.text = '';
    }
    this.json = treeJSON;

    this.label = (
      <DragLabel
        label={this.text}
        id={this.id}
        type={this.type}
        refParent={this.refParent}
        node={this}
        store={this.store}
      />
    );
    if (treeJSON.children) {
      this.allChildNodes = new Map();
      for (const childJSON of treeJSON.children) {
        const child = new TreeNode(childJSON, this, this.store);
        this.allChildNodes.set(child.id, child);
      }
    }
  }

  /**
   * Get a tree icon based on type
   *
   * @param {string} type - type of the tree node.
   * @return {React.component} - svg icon as react component
   */
  @autobind
  getIconForSecondaryLabel(type) {
    switch (type) {
      case 'shards':
        return <RootShardsIcon className="dbKodaSVG shardsIcon" width={30} height={30} />;
      case 'group_shards':
        return <ShardsIcon className="dbKodaSVG shardsIcon" width={30} height={30} />;
      case 'shard':
        return <ShardIcon className="dbKodaSVG shardIcon" width={30} height={30} />;
      case 'configservers':
        return <ConfigServersIcon className="dbKodaSVG configServersIcon" width={30} height={30} />;
      case 'config':
        return <ConfigIcon className="dbKodaSVG configIcon" width={30} height={30} />;
      case 'routers':
        return <RoutersIcon className="dbKodaSVG routersIcon" width={30} height={30} />;
      case 'mongos':
        return <MongosIcon className="dbKodaSVG mongosIcon" width={30} height={30} />;
      case 'databases':
        return <DatabasesIcon className="dbKodaSVG databasesIcon" width={30} height={30} />;
      case 'database':
        return <DatabaseIcon className="dbKodaSVG databaseIcon" width={30} height={30} />;
      case 'collection':
        return <CollectionIcon className="dbKodaSVG collectionIcon" width={30} height={30} />;
      case 'index':
        return <IndexIcon className="dbKodaSVG indexIcon" width={30} height={30} />;
      case 'users':
        return <UsersIcon className="dbKodaSVG usersIcon" width={30} height={30} />;
      case 'user':
        return <UserIcon className="dbKodaSVG userIcon" width={30} height={30} />;
      case 'roles':
        return <RolesIcon className="dbKodaSVG rolesIcon" width={30} height={30} />;
      case 'role':
        return <RoleIcon className="dbKodaSVG roleIcon" width={30} height={30} />;
      case 'property':
        return <PropertyIcon className="dbKodaSVG propertyIcon" width={30} height={30} />;
      case 'properties':
        return <PropertiesIcon className="dbKodaSVG propertiesIcon" width={30} height={30} />;
      case 'replicaset':
        return <ReplicaSetIcon className="dbKodaSVG replicaSetIcon" width={30} height={30} />;
      case 'primary':
        return <PrimaryIcon className="dbKodaSVG primaryIcon" width={30} height={30} />;
      case 'secondary':
        return <SecondaryIcon className="dbKodaSVG secondaryIcon" width={30} height={30} />;
      case 'arbiter':
        return <ArbiterIcon className="dbKodaSVG arbiterIcon" width={30} height={30} />;
      case 'replica_member':
        return <ReplicaMemberIcon className="dbKodaSVG replicaMemberIcon" width={30} height={30} />;
      default:
        return null;
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
          this.childNodes.push(child);
        } else if (child.text.toLowerCase().indexOf(filter) >= 0) {
          // add the child node if filtered text is found in the child node label
          this.childNodes.push(child);
        } else if (child.allChildNodes && child.allChildNodes.size > 0) {
          // add the child node if the grand child has filtered text in the label
          if (child.childNodes && child.childNodes.length > 0) {
            // Check if there are childNodes existing
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
      return 'group_' + parent.id.split('_')[1];
    }
    return treeJSON.text.toLowerCase().replace(' ', '');
  }

  /**
   * Returns the current tree node state to restore to it after a temporary change (used for SetTreeRoot functionality)
   */
  get StateObject() {
    const objState = {};
    objState.isFiltered = this.isFiltered || false;
    objState.isExpanded = this.isExpanded || false;
    objState.isSelected = this.isSelected || false;
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
    if (objState.allChildNodes.length > 0 && this.allChildNodes) {
      for (const childSO of objState.allChildNodes) {
        const childNode = this.allChildNodes.get(childSO.id);
        if (childNode) {
          childNode.StateObject = childSO;
        }
      }
    }
  }
}
