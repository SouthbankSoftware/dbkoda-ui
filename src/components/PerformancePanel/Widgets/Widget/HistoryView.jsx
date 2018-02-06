/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-02-05T12:18:29+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-02-06T17:17:02+11:00
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
import { autorun } from 'mobx';
import { LineChart, Line, Brush as BaseBrush, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import type { WidgetValue } from '~/api/Widget';
import styles from './HistoryView.scss';

// $FlowFixMe
const COLOUR_PALETTE: string[] = _.filter(styles, (v, k) => k.startsWith('colour'));
const DEFAULT_BRUSH_SIZE = 10;
const DEBOUNCED_SET_SHOULD_UPDATE_DELAY = 800;

const containerPadding = parseInt(styles.containerPadding, 10);
const descriptionHeight = parseInt(styles.descriptionHeight, 10);
const timeFormatter = d3.timeFormat('%H:%M:%S');

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
  values: *,
  projection: *
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

  componentWillMount() {
    // componentWillMount allows us to use setState without triggering extra rendering
    this._autorunDisposer = autorun(() => {
      const { values } = this.props;

      // must keep a shallow clone here, otherwise `recharts` will complain, nor can we use `.peek`
      const data = values.slice();

      if (
        this._shouldUpdate &&
        (this._brushEndIdx == null || this._brushEndIdx >= this.state.data.length)
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
    this._brushEndIdx = endIndex === this.state.data.length - 1 ? null : endIndex;
  };

  _debouncedSetShouldUpdate = _.debounce((shouldUpdate: boolean) => {
    this._shouldUpdate = shouldUpdate;
  }, DEBOUNCED_SET_SHOULD_UPDATE_DELAY);

  _onMouseEnterBrushTraveller = () => {
    this._debouncedSetShouldUpdate(false);
  };

  _onMouseLeaveBrushTraveller = () => {
    this._debouncedSetShouldUpdate(true);
  };

  componentWillUnmount() {
    this._autorunDisposer && this._autorunDisposer();
  }

  componentDidUpdate() {
    console.log('I am updated!!!');
  }

  render() {
    const { width, height, projection } = this.props;
    const { data } = this.state;

    // // let mobx track latest data for us
    // const data = this._data || this._getLatestData(this.props);

    let colourIdx = 0;
    const brushEndIdx = Math.max(
      this._brushEndIdx != null ? this._brushEndIdx : data.length - 1,
      0
    );
    const brushStartIdx = Math.max(brushEndIdx - this._brushSize + 1, 0);

    return (
      <div className="HistoryView">
        <p className="description">
          <b>Uplink speed: </b>host uplink network speed. host uplink network speed. host uplink
          network speed. host uplink network speed. host uplink network speed.{' '}
        </p>
        <LineChart
          width={width - 2 * containerPadding}
          height={height - 2 * containerPadding - descriptionHeight}
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis dataKey="timestamp" tickFormatter={timeFormatter} />
          <YAxis />
          <Tooltip labelFormatter={timeFormatter} />
          <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }} />
          <Brush
            dataKey="timestamp"
            height={18}
            stroke="#8884d8"
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

            return (
              <Line
                key={k}
                type="monotone"
                dataKey={data => {
                  const value = v(data.value);
                  return value === undefined ? null : value;
                }}
                name={k}
                dot={false}
                isAnimationActive={false}
                stroke={colour}
              />
            );
          })}
        </LineChart>
      </div>
    );
  }
}
