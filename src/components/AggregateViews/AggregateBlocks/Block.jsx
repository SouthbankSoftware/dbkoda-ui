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
import { inject, observer } from 'mobx-react';
import { DragSource, DropTarget } from 'react-dnd';
import { DragItemTypes } from '#/common/Constants.js';
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
  endDrag(props, monitor) {
    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();
    if (dropResult) {
      if (dropResult.type === 'firstBlock') {
        console.log(`Add ${item.type} to start of pipeline.`);
      } else if (dropResult.type === 'lastBlock') {
        console.log(`Add ${item.type} to end of pipeline.`);
      } else if (!dropResult.concrete) {
        console.log(`Can't drop ${item.type} because it is concrete.`);
      } else {
        console.log(`Dropped ${item.type} into ${dropResult.listPosition}`);
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
@observer
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
      type: props.type,
      concrete: props.concrete,
    };
  }

  render() {
    // Drag Drop Handlers.
    const connectDragSource = this.props.connectDragSource;
    const connectDropTarget = this.props.connectDropTarget;
    const isDragging = this.props.isDragging; // eslint-disable-line
    const isOver = this.props.isOver; // eslint-disable-line

    const classes = 'aggregateBlock ' + this.state.type;
    return connectDragSource(
      connectDropTarget(
        <li className={classes}>
          <p className="aggregateBlockTitle">
            {this.state.type}
          </p>
        </li>
    ));
  }
}

