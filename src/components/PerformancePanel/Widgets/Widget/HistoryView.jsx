/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-02-05T12:18:29+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-03-02T03:32:09+11:00
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
import * as d3 from 'd3';
import _ from 'lodash';
import { autorun, type IObservableArray } from 'mobx';
import {
  LineChart,
  Line,
  Brush as BaseBrush,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import type { WidgetValue } from '~/api/Widget';
import type { Projection } from './Widget';
import styles from './HistoryView.scss';

// $FlowFixMe
const COLOUR_PALETTE: string[] = _.filter(styles, (v, k) =>
  k.startsWith('colour')
);
const DEFAULT_BRUSH_SIZE = 30;
const DEBOUNCED_ENABLE_UPDATE_DELAY = 500;

const { primaryColour, primaryColourLighten30, backgroundColour } = styles;
const containerPadding = parseInt(styles.containerPadding, 10);
const descriptionHeight = parseInt(styles.descriptionHeight, 10);
const lineChartMargin = { top: 8, right: 5, left: -20, bottom: 5 };
const tooltipCursor = { stroke: primaryColourLighten30 };
const brushHeight = 18;
const brushHorizontalPadding = 52;
const timeFormatter = d3.timeFormat('%H:%M:%S');
const legendTimeFormatter = d3.timeFormat('%H:%M:%S %x');
// TODO: use hofUnitFormatter from Utils.js
const valueFormatter = d3.format('.2f');

const Brush = class extends BaseBrush {
  _handleEnterSlideOrTraveller = this.handleEnterSlideOrTraveller;
  handleEnterSlideOrTraveller = (...v) => {
    const { onMouseEnter } = this.props;
    onMouseEnter && onMouseEnter(...v);
    // workaround super
    this._handleEnterSlideOrTraveller();
  };

  _handleLeaveSlideOrTraveller = this.handleLeaveSlideOrTraveller;
  handleLeaveSlideOrTraveller = (...v) => {
    const { onMouseLeave } = this.props;
    onMouseLeave && onMouseLeave(...v);
    // workaround super
    this._handleLeaveSlideOrTraveller();
  };
};

type Props = {
  width: number,
  height: number,
  values: IObservableArray<WidgetValue>,
  projection: Projection,
  name: string,
  description: string
};

type State = {
  data: WidgetValue[]
};

export default class HistoryView extends React.PureComponent<Props, State> {
  // we don't put these variables as state, because we use them as record, and changing them doesn't
  // need to re-render our component
  _brushSize: number = DEFAULT_BRUSH_SIZE;
  _brushEndIdx: ?number = null;
  _shouldUpdate: boolean = true;
  _autorunDisposer: *;

  static defaultProps = {
    name: 'Unknown',
    description: 'n/a'
  };

  componentWillMount() {
    // componentWillMount allows us to use setState without triggering extra rendering
    this._autorunDisposer = autorun(() => {
      const { values } = this.props;

      // must keep a shallow clone here, otherwise `recharts` will complain, nor can we use `.peek`
      const data = values.slice();

      if (
        this._shouldUpdate &&
        (this._brushEndIdx == null ||
          this._brushEndIdx >= this.state.data.length)
      ) {
        // if brush right handle is at the rightmost edge, we update the view in realtime

        this._brushEndIdx = null;
        this.setState({
          data
        });
      }
    });
  }

  _onBrushChange = ({ startIndex, endIndex }) => {
    this._brushSize = endIndex - startIndex + 1;
    this._brushEndIdx =
      endIndex === this.state.data.length - 1 ? null : endIndex;
  };

  _debouncedEnableUpdate = _.debounce(() => {
    this._shouldUpdate = true;
  }, DEBOUNCED_ENABLE_UPDATE_DELAY);

  _onMouseEnterBrushTraveller = () => {
    this._debouncedEnableUpdate.cancel();
    this._shouldUpdate = false;
  };

  _onMouseLeaveBrushTraveller = () => {
    this._debouncedEnableUpdate();
  };

  componentWillUnmount() {
    this._autorunDisposer && this._autorunDisposer();
  }

  render() {
    const { width, height, projection, name, description } = this.props;
    const { data } = this.state;

    let colourIdx = 0;
    const brushEndIdx = Math.max(
      this._brushEndIdx != null ? this._brushEndIdx : data.length - 1,
      0
    );
    const brushStartIdx = Math.max(brushEndIdx - this._brushSize + 1, 0);

    return (
      <div className="HistoryView" style={{ width, height }}>
        <LineChart
          className="chart"
          width={width - 2 * containerPadding}
          height={height - 2 * containerPadding - descriptionHeight}
          data={data}
          margin={lineChartMargin}
        >
          <XAxis
            type="number"
            domain={['auto', 'auto']}
            stroke={primaryColour}
            dataKey="timestamp"
            scale="linear"
            tickFormatter={timeFormatter}
          />
          <YAxis stroke={primaryColour} />
          <Tooltip
            formatter={valueFormatter}
            labelFormatter={legendTimeFormatter}
            cursor={tooltipCursor}
          />
          <Legend verticalAlign="top" iconType="circle" iconSize={8} />
          <Brush
            dataKey="timestamp"
            x={brushHorizontalPadding}
            width={width - 2 * containerPadding - 2 * brushHorizontalPadding}
            height={brushHeight}
            stroke={primaryColour}
            fill={backgroundColour}
            startIndex={brushStartIdx}
            endIndex={brushEndIdx}
            onChange={this._onBrushChange}
            tickFormatter={timeFormatter}
            onMouseEnter={this._onMouseEnterBrushTraveller}
            onMouseLeave={this._onMouseLeaveBrushTraveller}
          />
          {_.map(projection, (v, k) => {
            const colour = COLOUR_PALETTE[colourIdx % COLOUR_PALETTE.length];
            colourIdx += 1;
            if (k.match('_')) {
              k = k.split('_')[1];
            }
            if (k.match(/UsPs$/g)) {
              k = k.substring(0, k.length - 4);
            } else if (k.match(/Us$|Ps$/g)) {
              k = k.substring(0, k.length - 2);
            }
            return (
              <Line
                key={k}
                type="linear"
                dataKey={data => {
                  const value = v(data);
                  return typeof value === 'number' ? value : null;
                }}
                name={k}
                dot={false}
                activeDot={tooltipCursor}
                isAnimationActive={false}
                stroke={colour}
              />
            );
          })}
        </LineChart>
        <p className="description">
          <b className="name">{name}: </b>
          {description}
        </p>
      </div>
    );
  }
}
