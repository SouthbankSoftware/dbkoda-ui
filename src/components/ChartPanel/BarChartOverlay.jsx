/**
 * @flow
 *
 * @Author: guiguan
 * @Date:   2017-10-03T20:03:05+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-10-10T16:00:05+11:00
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
import { DropTarget } from 'react-dnd';
import _ from 'lodash';
import classnames from 'classnames';
// $FlowFixMe
import { DragItemTypes } from '#/common/Constants';
import './BarChartOverlay.scss';

const barChartDropTarget = {
  drop(props) {
    const { target, action } = props;

    return {
      target,
      action
    };
  }
};

// $FlowIssue
@DropTarget(DragItemTypes.CHART_DATA_TREE_NODE, barChartDropTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  over: monitor.isOver({ shallow: true })
}))
class BarChartDropTarget extends React.PureComponent<*> {
  render() {
    const { target, action, grid, connectDropTarget, over } = this.props;
    const {
      chartWidth: width,
      chartHeight: height,
      height: gridHeight,
      x: gridX,
      y: gridY
    } = grid.props;
    const gridOriginX = gridX;
    const gridOriginY = gridY + gridHeight;
    const centerX = gridX * 2;
    const centerY = height - (height - gridOriginY) * 2;
    const unload = action === 'unload';

    if (target === 'y') {
      return connectDropTarget(
        <g className={classnames('YAxis', { over, unload })}>
          <path d={`M0 0 L0 ${height} L${centerX} ${centerY} L${centerX} 0 Z`} />
          <text transform={`translate(${gridOriginX}, ${gridOriginY / 2})rotate(-90)`}>
            {`${unload ? 'Unload from' : 'Load to'} Y axis`}
          </text>
        </g>
      );
    } else if (target === 'x') {
      return connectDropTarget(
        <g className={classnames('XAxis', { over, unload })}>
          <path
            d={`M${centerX} ${centerY} L0 ${height} L${width} ${height} L${width} ${centerY} Z`}
          />
          <text transform={`translate(${(width - gridOriginX) / 2 + gridOriginX}, ${gridOriginY})`}>
            {`${unload ? 'Unload from' : 'Load to'} X axis`}
          </text>
        </g>
      );
    } else if (target === 'center') {
      return connectDropTarget(
        <g className={classnames('Center', { over, unload })}>
          <path d={`M${centerX} 0 L${centerX} ${centerY} L${width} ${centerY} L${width} 0 Z`} />
          <text transform={`translate(${(width - centerX) / 2 + centerX}, ${centerY / 2})`}>
            {`${unload ? 'Unload from' : 'Load to'} center`}
          </text>
        </g>
      );
    }
    return null;
  }
}

export default class BarChartOverlay extends React.PureComponent<*> {
  render() {
    const { getBarChartGrid } = this.props;
    const grid = getBarChartGrid();

    if (!grid) return null;

    const { getAllowedChartComponentOperations, valueSchemaPath, valueType } = this.props;

    const allowedOperations = getAllowedChartComponentOperations(valueSchemaPath, valueType);

    const { chartWidth: width, chartHeight: height } = grid.props;

    return (
      <div className="BarChartOverlay">
        <svg width={width} height={height}>
          {_.map(allowedOperations, ({ target, action }) => (
            <BarChartDropTarget key={target} target={target} action={action} grid={grid} />
          ))}
        </svg>
      </div>
    );
  }
}
