/**
 * @flow
 *
 * @Author: guiguan
 * @Date:   2017-10-04T00:40:35+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-10-04T01:18:49+11:00
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

import * as React from 'react';
import { DragLayer } from 'react-dnd';
import './DataTreeDataNodeDragLayer.scss';

function getItemStyles(props) {
  const { initialOffset, currentOffset } = props;
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    };
  }

  const { x, y } = currentOffset;

  return {
    transform: `translate(${x}px,${y}px)`,
  };
}

// $FlowIssue
@DragLayer(monitor => ({
  item: monitor.getItem(),
  initialOffset: monitor.getInitialSourceClientOffset(),
  currentOffset: monitor.getSourceClientOffset(),
  isDragging: monitor.isDragging(),
}))
export default class DataTreeDataNodeDragLayer extends React.PureComponent<*> {
  render() {
    const { item, isDragging } = this.props;

    if (!isDragging) {
      return null;
    }

    return (
      <div className="DataTreeDataNodeDragLayer">
        <div style={getItemStyles(this.props)}>{item.valueSchemaPath}</div>
      </div>
    );
  }
}
