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
 * @Author: Michael Harrison
 * @Date:   2017-07-21 12:36:36
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   Mike
 * @Last modified time: 2017-07-21 12:36:40
 */

import React from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import { action } from 'mobx';
import { DragSource, DropTarget } from 'react-dnd';
import { DragItemTypes } from '#/common/Constants.js';
import DragIcon from '../../../styles/icons/drag-icon.svg';
import BlockIcon from '../../../styles/icons/center-block.svg';
import BlockTopIcon from '../../../styles/icons/round-top-block.svg';
import BlockBottomIcon from '../../../styles/icons/round-bottom-block.svg';
import CloseIcon from '../../../styles/icons/close-profile-icon.svg';
import '../style.scss';

/** ===| Drag Drop Functions |=== **/
const blockSource = {
  beginDrag(props) {
    return {
      type: props.type,
      listPosition: props.listPosition,
      concrete: props.concrete,
      position: props.listPosition
    };
  },
  @action
  endDrag(props, monitor) {
    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();
    if (item.concrete) {
      // Re-order
      props.moveBlock(item.position, dropResult.listPosition);
    } else if (dropResult) {
      // New Block
      if (dropResult.type === 'firstBlock') {
        props.addBlock(item.type, 'START');
      } else if (dropResult.type === 'lastBlock') {
        props.addBlock(item.type, 'END');
      } else {
        props.addBlock(item.type, dropResult.listPosition);
      }
    }
  }
};
const blockTarget = {
  drop(props) {
    return {
      type: props.type,
      listPosition: props.listPosition,
      concrete: props.concrete
    };
  }
};
const collectSource = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
};
const collectTarget = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
};
/** ============================= **/

@inject(allStores => ({
  store: allStores.store,
}))
@DragSource(DragItemTypes.VISUAL_BLOCK, blockSource, collectSource)
@DropTarget(DragItemTypes.VISUAL_BLOCK, blockTarget, collectTarget)
export default class Block extends React.Component {
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    isOver: PropTypes.bool.isRequired
  }
  constructor(props) {
    super(props);
    this.state = {
      listPosition: props.listPosition,
      posType: props.positionType,
      type: props.type,
      status: props.status,
      concrete: props.concrete,
      color: this.props.color
    };
  }

  render() {
    // Drag Drop Handlers.
    const connectDragSource = this.props.connectDragSource;
    const connectDropTarget = this.props.connectDropTarget;
    const isDragging = this.props.isDragging; // eslint-disable-line
    const isOver = this.props.isOver; // eslint-disable-line
    this.state.color = 'color_' + this.props.color;
    const classes = 'aggregateBlock ' + this.state.type + ' ' + this.state.listPosition + ' selected_' + this.props.selected;
    let blockColorClasses;
    let closeColorClasses;
    if (this.props.status === 'pending') {
      blockColorClasses = 'dbKodaSVG ' + this.props.positionType + ' invalid';
      closeColorClasses = 'closeBlockIcon invalid';
    } else {
      blockColorClasses = 'dbKodaSVG ' + this.props.positionType + ' ' + this.state.color;
      closeColorClasses = 'closeBlockIcon ' + this.state.color;
    }
    return connectDragSource(
      connectDropTarget(
        <div className={classes}>
          {!this.state.concrete &&
            <div className="blockPalletteWrapper">
              <DragIcon width={50} height={50} className="dbKodaSVG" onClick={() => this.props.addBlock(this.state.type, 'END')} />
              <p className="aggregateBlockTitle">
                {this.props.type}
              </p>
            </div>
          }
          {this.state.concrete && this.props.positionType === 'MIDDLE' &&
            <div className="blockBuilderWrapper">
              <BlockIcon className={blockColorClasses}
                onClick={() => this.props.onClickCallback(this.state.listPosition)} />
              <p className="aggregateBlockTitle">
                ${this.props.type.toLowerCase()}
              </p>
              <CloseIcon className={closeColorClasses}
                onClick={() => this.props.onClickCloseCallback(this.state.listPosition)} />
            </div>
          }
          {this.state.concrete && this.props.positionType === 'END' &&
            <div className="blockBuilderWrapper">
              <BlockBottomIcon className={blockColorClasses}
                onClick={() => this.props.onClickCallback(this.state.listPosition)} />
              <p className="aggregateBlockTitle">
                ${this.props.type.toLowerCase()}
              </p>
              <CloseIcon className={closeColorClasses}
                onClick={() => this.props.onClickCloseCallback(this.state.listPosition)} />
            </div>
          }
          {this.state.concrete && this.props.positionType === 'START' &&
            <div className="blockBuilderWrapper">
              <BlockTopIcon className={blockColorClasses}
                onClick={() => this.props.onClickCallback(this.state.listPosition)} />
              <p className="aggregateBlockTitle">
                ${this.props.type.toLowerCase()}
              </p>
              <CloseIcon className={closeColorClasses}
                onClick={() => this.props.onClickCloseCallback(this.state.listPosition)} />
            </div>
          }

        </div>
    ));
  }
}

