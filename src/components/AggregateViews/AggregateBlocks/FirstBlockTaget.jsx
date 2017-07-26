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
import { DropTarget } from 'react-dnd';
import { DragItemTypes } from '#/common/Constants.js';
import '../style.scss';

/** ===| Drag Drop Functions |=== **/
const blockTarget = {
  drop() {
    return {
      type: 'firstBlock'
    };
  }
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
@DropTarget(DragItemTypes.VISUAL_BLOCK, blockTarget, collectTarget)
export default class FirstBlockTarget extends React.Component {
  static propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
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
    const connectDropTarget = this.props.connectDropTarget;
    const isOver = this.props.isOver; // eslint-disable-line

    return connectDropTarget(
      <li className="firstBlockTarget" />
    );
  }
}

