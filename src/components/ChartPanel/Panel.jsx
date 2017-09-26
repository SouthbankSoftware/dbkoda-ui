/**
 * @flow
 *
 * @Author: guiguan
 * @Date:   2017-09-21T15:25:12+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-09-26T17:34:37+10:00
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
import { action, computed } from 'mobx';
import { inject, observer } from 'mobx-react';
import DataTree, {
  type Schema,
  type ChartComponentChangeHandler,
  type GetAllowedChartComponentOperations,
  type ChartComponentOperation,
} from './DataTree';
import BarChart, { type ChartData, type ChartComponent } from './BarChart';
import './Panel.scss';

const DEBOUNCE_DELAY = 100;
const CHART_XY_LIMIT = 20;
const CHART_CENTER_LIMIT = 10;

type Data = {}[];
type ChartComponents = {
  chartComponentX: ChartComponent,
  chartComponentY: ChartComponent,
  chartComponentCenter: ChartComponent,
};
type BarChartData = {
  data: ChartData,
  componentX: ChartComponent,
  componentY: ChartComponent,
  componentCenter: ChartComponent,
};

type Props = {
  data: Data,
  dataTreeWidth: number,
  chartWidth: number,
  chartHeight: number,
  chartComponentX: ?ChartComponent,
  chartComponentY: ?ChartComponent,
  chartComponentCenter: ?ChartComponent,
};

type State = {};

// $FlowIssue
@inject(({ store }, props) => {
  const { editorId } = props;

  return {
    store: store.outputs.get(editorId).chartPanel,
  };
})
@observer
export default class ChartPanel extends React.PureComponent<
  { store: Props },
  State,
> {
  // constructor(props: Props) {
  //   super(props);
  //
  //   const { dataTreeDefaultWidth, data } = props;
  //
  //   this.state = {
  //     dataTreeWidth: dataTreeDefaultWidth || 0,
  //     chartWidth: 0,
  //     chartHeight: 0,
  //     schema: this._generateDataSchema(data),
  //     barChartData: this._generateChartData(),
  //     chartComponentX: null,
  //     chartComponentY: null,
  //     chartComponentCenter: null,
  //   };
  // }

  // componentWillReceiveProps({ data, hash: nextHash }: Props) {
  //   const { hash } = this.props;
  //   if (hash !== nextHash) {
  //     // update schema when necessary
  //     this.setState({
  //       schema: this._generateDataSchema(data),
  //       barChartData: this._generateChartData(),
  //       chartComponentX: null,
  //       chartComponentY: null,
  //       chartComponentCenter: null,
  //     });
  //   }
  // }

  // $FlowIssue
  @computed
  get schema(): Schema {
    const { data } = this.props.store;

    return this._generateDataSchema(data);
  }

  // $FlowIssue
  @computed
  get barChartData(): BarChartData {
    const {
      chartComponentX,
      chartComponentY,
      chartComponentCenter,
    } = this.props.store;

    return this._generateChartData(
      chartComponentX,
      chartComponentY,
      chartComponentCenter,
    );
  }

  _getComponentsForBarChart(
    chartComponentX: ?ChartComponent,
    chartComponentY: ?ChartComponent,
    chartComponentCenter: ?ChartComponent,
  ): ChartComponents {
    const resultChartComponents = {};

    if (chartComponentX) {
      resultChartComponents.chartComponentX = chartComponentX;
    } else if (!chartComponentY || chartComponentY.valueType === 'number') {
      // use x as default categorical axis
      resultChartComponents.chartComponentX = {
        name: 'x',
        valueSchemaPath: 'default',
        valueType: 'string',
      };
    } else {
      // use x as default numerical axis
      resultChartComponents.chartComponentX = {
        name: 'x',
        valueSchemaPath: 'default',
        valueType: 'number',
      };
    }

    if (chartComponentY) {
      resultChartComponents.chartComponentY = chartComponentY;
    } else if (!chartComponentX || chartComponentX.valueType === 'string') {
      // use y as default numerical axis
      resultChartComponents.chartComponentY = {
        name: 'y',
        valueSchemaPath: 'default',
        valueType: 'number',
      };
    } else {
      // use y as default categorical axis
      resultChartComponents.chartComponentY = {
        name: 'y',
        valueSchemaPath: 'default',
        valueType: 'string',
      };
    }

    if (chartComponentCenter) {
      resultChartComponents.chartComponentCenter = chartComponentCenter;
    } else {
      // use default center
      resultChartComponents.chartComponentCenter = {
        name: 'center',
        valueSchemaPath: 'default',
        valueType: 'string',
      };
    }

    return resultChartComponents;
  }

  _generateChartData(
    x: ?ChartComponent,
    y: ?ChartComponent,
    center: ?ChartComponent,
  ): BarChartData {
    const { data } = this.props.store;
    const {
      chartComponentX,
      chartComponentY,
      chartComponentCenter,
    } = this._getComponentsForBarChart(x, y, center);
    let categoricalComponent;
    let numericalComponent;

    if (chartComponentX.valueType === 'string') {
      categoricalComponent = chartComponentX;
      numericalComponent = chartComponentY;
    } else {
      categoricalComponent = chartComponentY;
      numericalComponent = chartComponentX;
    }

    // scan through data
    const chartDataMap: Map<string, { [string]: number }> = new Map();
    const numericalBinMap: Map<string, boolean> = new Map();
    _.forEach(data, (v) => {
      let categoricalValue =
        categoricalComponent.valueSchemaPath === 'default'
          ? 'default'
          : _.get(v, categoricalComponent.valueSchemaPath, 'other'); // treat missing value as `other`
      const numericalValue =
        numericalComponent.valueSchemaPath === 'default'
          ? 1
          : _.get(v, numericalComponent.valueSchemaPath, 0);
      let numericalBin =
        chartComponentCenter.valueSchemaPath === 'default'
          ? 'default'
          : _.get(v, chartComponentCenter.valueSchemaPath, 'other'); // treat missing value as `other`

      if (categoricalValue !== 'other') {
        const size = chartDataMap.size - (chartDataMap.has('other') ? 1 : 0);
        if (size >= CHART_XY_LIMIT) {
          // limit exceeded, show as `other`
          categoricalValue = 'other';
        }
      }

      if (numericalBin !== 'other') {
        const size =
          numericalBinMap.size - (numericalBinMap.has('other') ? 1 : 0);
        if (size >= CHART_CENTER_LIMIT) {
          // limit exceeded, show as `other`
          numericalBin = 'other';
        }
      }

      const centerObj = chartDataMap.get(categoricalValue);
      if (centerObj !== undefined) {
        if (numericalBin in centerObj) {
          centerObj[numericalBin] += numericalValue;
        } else {
          centerObj[numericalBin] = numericalValue;
        }
      } else {
        chartDataMap.set(categoricalValue, { [numericalBin]: numericalValue });
      }

      if (!numericalBinMap.has(numericalBin)) {
        numericalBinMap.set(numericalBin, true);
      }
    });

    // convert to ChartData
    const chartData = [];
    for (const [k, v] of chartDataMap.entries()) {
      chartData.push({
        [categoricalComponent.name]: k,
        [numericalComponent.name]: v,
      });
    }

    chartComponentCenter.values = [...numericalBinMap.keys()];

    return {
      data: chartData,
      componentX: chartComponentX,
      componentY: chartComponentY,
      componentCenter: chartComponentCenter,
    };
  }

  _generateDataSchema(data: Data) {
    const obj = _.head(data);

    return this._generateObjectSchema(obj);
  }

  _generateObjectSchema(obj: {}) {
    const schema = {};

    _.forOwn(obj, (v: mixed, k: string) => {
      if (typeof v === 'string') {
        schema[k] = 'string';
      } else if (typeof v === 'number') {
        schema[k] = 'number';
      } else if (typeof v === 'object' && v !== null) {
        schema[k] = this._generateObjectSchema(v);
      }
    });

    return schema;
  }

  _onSplitPaneResize = _.debounce(
    action((width: number) => {
      const { dataTreeWidth, chartWidth } = this.props.store;

      _.assign(this.props.store, {
        dataTreeWidth: width,
        chartWidth: dataTreeWidth + chartWidth - width,
      });
    }),
    DEBOUNCE_DELAY,
  );

  _onPanelResize = _.debounce(
    action((width: number, height: number) => {
      const { dataTreeWidth } = this.props.store;

      _.assign(this.props.store, {
        chartWidth: width - dataTreeWidth,
        chartHeight: height,
      });
    }),
    DEBOUNCE_DELAY,
  );

  _onChartComponentChange: ChartComponentChangeHandler = action(
    (operation, valueSchemaPath, valueType) => {
      const { action, target } = operation;

      if (action === 'load') {
        if (target === 'x') {
          this.props.store.chartComponentX = {
            name: 'x',
            valueSchemaPath,
            valueType,
          };
        } else if (target === 'y') {
          this.props.store.chartComponentY = {
            name: 'y',
            valueSchemaPath,
            valueType,
          };
        } else {
          this.props.store.chartComponentCenter = {
            name: 'center',
            valueSchemaPath,
            valueType,
          };
        }
      } else {
        this.props.store[`chartComponent${_.upperFirst(target)}`] = null;
      }
    },
  );

  /**
   * Define inter chart component constraints
   */
  _getAllowedChartComponentOperations: GetAllowedChartComponentOperations = (
    targetValueSchemaPath,
    targetValueType,
  ) => {
    const operations: ChartComponentOperation[] = [];

    if (targetValueType !== 'string' && targetValueType !== 'number') {
      return operations;
    }

    const {
      chartComponentX,
      chartComponentY,
      chartComponentCenter,
    } = this.props.store;

    if (
      chartComponentX &&
      chartComponentX.valueSchemaPath === targetValueSchemaPath
    ) {
      operations.push({
        action: 'unload',
        target: 'x',
      });
    } else if (
      !chartComponentY ||
      chartComponentY.valueType !== targetValueType
    ) {
      operations.push({
        action: 'load',
        target: 'x',
      });
    }

    if (
      chartComponentY &&
      chartComponentY.valueSchemaPath === targetValueSchemaPath
    ) {
      operations.push({
        action: 'unload',
        target: 'y',
      });
    } else if (
      !chartComponentX ||
      chartComponentX.valueType !== targetValueType
    ) {
      operations.push({
        action: 'load',
        target: 'y',
      });
    }

    if (
      chartComponentCenter &&
      chartComponentCenter.valueSchemaPath === targetValueSchemaPath
    ) {
      operations.push({
        action: 'unload',
        target: 'center',
      });
    } else if (targetValueType === 'string') {
      operations.push({
        action: 'load',
        target: 'center',
      });
    }

    return operations;
  };

  render() {
    const {
      dataTreeWidth,
      chartWidth,
      chartHeight,
      chartComponentX,
      chartComponentY,
      chartComponentCenter,
    } = this.props.store;

    const { schema, barChartData } = this;

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
          <DataTree
            schema={schema}
            onChartComponentChange={this._onChartComponentChange}
            getAllowedChartComponentOperations={
              this._getAllowedChartComponentOperations
            }
            chartComponentX={chartComponentX}
            chartComponentY={chartComponentY}
            chartComponentCenter={chartComponentCenter}
          />
          {
            <BarChart
              width={chartWidth}
              height={chartHeight}
              {...barChartData}
            />
          }
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
