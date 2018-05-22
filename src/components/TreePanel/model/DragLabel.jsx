/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-03-15T10:54:51+11:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-05-18T11:08:20+10:00
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
import UserIcon from '../../../styles/icons/user-icon.svg';
import ShardsIcon from '../../../styles/icons/shards-icon-2.svg';
import CollectionIcon from '../../../styles/icons/collection-icon.svg';

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
            const icon = this.getIconFor(objAction.icon);
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
  getIconFor(icon) {
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
    const { connectDragSource, isDragging } = this.props;
    return connectDragSource(
      <div className="labelWrapper">
        <span
          className="nodeLbl"
          style={{
            opacity: isDragging ? 0.5 : 1,
            cursor: 'move'
          }}
        >
          {this.FilteredTextLabel}
        </span>
        <span className="additionalActions">
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
                  l.info('Open Context Menu');
                }}
              >
                <DropdownIcon className="pt-icon dbKodaSVG" width={16} height={16} />
              </AnchorButton>
            }
          />
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
