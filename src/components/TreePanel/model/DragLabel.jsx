/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-03-15T10:54:51+11:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-05-22T10:50:06+10:00
 *
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

import React from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import { computed, action } from 'mobx';
import { DragSource } from 'react-dnd';
import { DragItemTypes } from '#/common/Constants.js';
import {
  AnchorButton,
  Popover,
  PopoverInteractionKind,
  Intent,
  Menu,
  MenuItem,
  MenuDivider,
  Position
} from '@blueprintjs/core';
import TreeActions from '../templates/tree-actions/actions.json';
import DropdownIcon from '../../../styles/icons/dropdown-menu-icon.svg';
import SettingsIcon from '../../../styles/icons/settings-icon.svg';
import DocumentIcon from '../../../styles/icons/document-solid-icon.svg';
import RemoveUserIcon from '../../../styles/icons/users-icon-2.svg';
import AddIcon from '../../../styles/icons/add-icon.svg';
import CloseIcon from '../../../styles/icons/cross-icon.svg';

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

const labelSource = {
  /**
   * drag call back function with attached the props with the element being dragged
   * @param  {object} props props of this element from which the drag process is being initiated
   * @return {object}       returns the props to be passed on to drop target
   */
  beginDrag(props) {
    return { label: props.label, type: props.type, id: props.id, refParent: props.refParent };
  }
};
/**
 * Collect the information required by the connector and inject it into the react component as props
 * @param {} connect - connectors let you assign one of the predefined roles (a drag source, a drag preview, or a drop target) to the DOM nodes
 * @param {} monitor - keeps the state of drag process, e.g object which is being dragged
 * @return {object} props object for component
 */
function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

/**
 * Defines the label of tree component which is dragable using react-dnd
 */
@inject('treeState')
@observer
class DragLabel extends React.Component {
  Menus = [];
  constructor(props) {
    super(props);
    this.store = props.store;
    const Actions = TreeActions[props.type];
    this.Menus = [];
    if (Actions && Actions.length > 0) {
      for (const objAction of Actions) {
        if (objAction.type && objAction.type == 'divider') {
          this.Menus.push(<MenuDivider key={objAction.name} />);
        } else {
          let bDevOnlyFeature = false;
          if (process.env.NODE_ENV !== 'development' && objAction.development) {
            bDevOnlyFeature = true;
          }
          if (!bDevOnlyFeature) {
            const icon = this.getIconForMenu(objAction.icon);
            if (icon != null) {
              this.Menus.push(
                <div className="menuItemWrapper" key={objAction.name} data-id={objAction.name}>
                  <MenuItem
                    onClick={this.handleTreeActionClick}
                    text={objAction.text}
                    key={objAction.name}
                    icon={icon}
                    intent={Intent.NONE}
                  />
                </div>
              );
            } else {
              this.Menus.push(
                <div className="menuItemWrapper" key={objAction.name} data-id={objAction.name}>
                  <MenuItem
                    onClick={this.handleTreeActionClick}
                    text={objAction.text}
                    key={objAction.name}
                    icon={objAction.icon}
                    intent={Intent.NONE}
                  />
                </div>
              );
            }
          }
        }
      }
    }
  }
  getIconForMenu(icon) {
    switch (icon) {
      case 'settings':
        return <SettingsIcon className="pt-icon dbKodaSVG" width={16} height={16} />;
      case 'document':
        return <DocumentIcon className="pt-icon dbKodaSVG" width={16} height={16} />;
      case 'user':
        return <UserIcon className="pt-icon dbKodaSVG" width={16} height={16} />;
      case 'remove-user':
        return <RemoveUserIcon className="pt-icon dbKodaSVG" width={16} height={16} />;
      case 'add':
        return <AddIcon className="pt-icon dbKodaSVG" width={16} height={16} />;
      case 'close':
        return <CloseIcon className="pt-icon dbKodaSVG" width={16} height={16} />;
      case 'shards':
        return <ShardsIcon className="pt-icon dbKodaSVG" width={16} height={16} />;
      case 'collection':
        return <CollectionIcon className="pt-icon dbKodaSVG" width={16} height={16} />;
      case 'dropdown':
        return <DropdownIcon className="pt-icon dbKodaSVG" width={16} height={16} />;
      default:
        return null;
    }
  }
  /**
   * Get a tree icon based on type
   *
   * @param {string} type - type of the tree node.
   * @return {React.component} - svg icon as react component
   */
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
  @action.bound
  handleTreeActionClick = (e: React.MouseEvent) => {
    this.store.treePanel.nodeOpened = this.props.node;
    this.store.treePanel.action = e;
  };
  /**
   * Get the trimmed server name in case of server config/shard treeNode
   */
  get ServerName() {
    const serverName = this.props.label;
    let newServerName = serverName;
    const dotPos = serverName.indexOf('.');
    const colonPos = serverName.indexOf(':');
    if (colonPos + dotPos > 1) {
      newServerName = serverName.substr(0, dotPos) + serverName.substr(colonPos);
    }
    return newServerName;
  }
  /**
   * Returns the text of the label to render with filtered text highlighted
   * @return {string} - HTML text
   */
  @computed
  get FilteredTextLabel() {
    const filterText = this.props.treeState.filter;
    const strText = this.props.label;
    const matchStart = strText.toLowerCase().indexOf(filterText.toLowerCase());
    if (filterText != '' && matchStart >= 0) {
      const matchEnd = matchStart + (filterText.length - 1);
      const beforeMatch = strText.slice(0, matchStart);
      const matchText = strText.slice(matchStart, matchEnd + 1);
      const afterMatch = strText.slice(matchEnd + 1);
      return (
        <span>
          {beforeMatch}
          <mark>{matchText}</mark>
          {afterMatch}
        </span>
      );
    }
    if (
      this.props.type == 'shard' ||
      this.props.type == 'config' ||
      this.props.type == 'mongos' ||
      this.props.type == 'replica_member' ||
      this.props.type == 'primary' ||
      this.props.type == 'secondary' ||
      this.props.type == 'arbiter'
    ) {
      return this.ServerName;
    }
    return strText;
  }
  /**
   * Main Render method of this React Component
   * @return {connectDragSource} - returns the react component with the dragDrop api wrapper.
   */
  render() {
    const { connectDragSource, isDragging, type } = this.props;
    const nodeIcon = this.getIconForSecondaryLabel(type);
    return connectDragSource(
      <div className="labelWrapper">
        <span className="nodeIcon">{nodeIcon}</span>
        <span
          className="nodeLbl"
          style={{
            opacity: isDragging ? 0.5 : 1,
            cursor: 'move',
            width: '100%'
          }}
        >
          {this.FilteredTextLabel}
        </span>
        <span className="additionalActions">
          {this.Menus.length !== 0 && (
            <Popover
              minimal
              interactionKind={PopoverInteractionKind.CLICK}
              position={Position.TOP}
              popoverClassName="toolTip"
              content={<Menu>{this.Menus}</Menu>}
              target={
                <AnchorButton
                  className="button"
                  onClick={() => {
                    l.info(this.Menus);
                  }}
                >
                  <DropdownIcon className="pt-icon dbKodaSVG" width={16} height={16} />
                </AnchorButton>
              }
            />
          )}
        </span>
      </div>
    );
  }
}

DragLabel.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired
};

export default DragSource(DragItemTypes.LABEL, labelSource, collect)(DragLabel);
