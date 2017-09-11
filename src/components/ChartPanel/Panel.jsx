/* @flow
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
import SplitPane from 'react-split-pane';
import ReactResizeDetector from 'react-resize-detector';
import _ from 'lodash';
import DataTree from './DataTree';
import BarChart from './BarChart';
import './Panel.scss';

const DEBOUNCE_DELAY = 100;

type Props = {
  dataTreeDefaultWidth: ?number,
};

type State = {
  dataTreeWidth: number,
  barChartWidth: number,
  barChartHeight: number,
};

export default class ChartPanel extends React.Component<Props, State> {
  static defaultProps = {
    dataTreeDefaultWidth: 250,
  };

  state = {
    dataTreeWidth: this.props.dataTreeDefaultWidth || 0,
    barChartWidth: 0,
    barChartHeight: 0,
  };

  _onSplitPaneResize = _.debounce((width: number) => {
    const { dataTreeWidth, barChartWidth } = this.state;

    this.setState({ dataTreeWidth: width, barChartWidth: dataTreeWidth + barChartWidth - width });
  }, DEBOUNCE_DELAY);

  _onPanelResize = _.debounce((width: number, height: number) => {
    const { dataTreeWidth } = this.state;

    this.setState({ barChartWidth: width - dataTreeWidth, barChartHeight: height });
  }, DEBOUNCE_DELAY);

  render() {
    const { dataTreeWidth, barChartWidth, barChartHeight } = this.state;

    return (
      <div className="ChartPanel">
        <SplitPane
          className="SplitPane"
          split="vertical"
          defaultSize={dataTreeWidth}
          minSize={50}
          maxSize={1000}
          pane2Style={{
            display: 'flex',
            flexDirection: 'column',
          }}
          onChange={this._onSplitPaneResize}
        >
          <DataTree />
          <BarChart
            width={barChartWidth}
            height={barChartHeight}
            data={[
              { name: 'Prod A', prodCount: 4000, Cost: 2400, amt: 2400 },
              { name: 'Prod B', prodCount: 3000, Cost: 1398, amt: 2210 },
              { name: 'Prod C', prodCount: 2000, Cost: 9800, amt: 2290 },
              { name: 'Prod D', prodCount: 2780, Cost: 3908, amt: 2000 },
              { name: 'Prod E', prodCount: 1890, Cost: 4800, amt: 2181 },
              { name: 'Prod F', prodCount: 2390, Cost: 3800, amt: 2500 },
              { name: 'Prod G', prodCount: 3490, Cost: 4300, amt: 2100 },
            ]}
          />
        </SplitPane>
        <ReactResizeDetector
          className="BarChart"
          handleWidth
          handleHeight
          onResize={this._onPanelResize}
        />
      </div>
    );
  }
}
