/**
 * @flow
 *
 * @Author: guiguan
 * @Date:   2017-09-21T15:25:12+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-10-03T11:10:50+11:00
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
import { action, computed, reaction } from 'mobx';
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
export const DEFAULT_AXIS_VALUE_SCHEMA_PATH = '[[DEFAULT]]';

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
type SelectedComponents = {
  chartComponentX?: ChartComponent,
  chartComponentY?: ChartComponent,
  chartComponentCenter?: ChartComponent,
};
type DataSchema = {
  schema: Schema,
  selectedComponents: SelectedComponents,
};

type Store = {
  chartPanel: {
    data: Data,
    dataTreeWidth: number,
    chartWidth: number,
    chartHeight: number,
    chartComponentX: ?ChartComponent,
    chartComponentY: ?ChartComponent,
    chartComponentCenter: ?ChartComponent,
    loading: boolean,
  },
  outputPanel: {
    currentTab: string,
  },
};

type Props = {
  store: Store,
  editorId: string,
  tabId: string,
};

type State = {};

// $FlowIssue
@inject(({ store }, props) => {
  const { editorId } = props;

  return {
    store: {
      chartPanel: store.outputs.get(editorId).chartPanel,
      outputPanel: store.outputPanel,
    },
    editorId,
    tabId: `Chart-${editorId}`,
  };
})
@observer
export default class ChartPanel extends React.PureComponent<Props, State> {
  reactions = [];
  resizeDetector: React.ElementRef<*>;

  constructor(props: Props) {
    super(props);

    this.reactions.push(
      reaction(
        () => this.selectedComponents,
        selectedComponents => this._autoSelectComponents(selectedComponents),
      ),
    );
  }

  componentDidMount() {
    this.reactions.push(
      reaction(
        () => {
          const { store: { outputPanel: { currentTab } }, tabId } = this.props;

          return currentTab === tabId;
        },
        (isActive) => {
          if (isActive) {
            // fix container size undetected issue when this component is mounted behind the scene
            this.resizeDetector.componentDidMount();
          }
        },
      ),
    );
  }

  componentWillUnmount() {
    _.forEach(this.reactions, r => r());
  }

  // $FlowIssue
  @computed
  get dataSchema(): DataSchema {
    const { data } = this.props.store.chartPanel;

    return this._generateDataSchema(data);
  }

  // $FlowIssue
  @computed
  get schema(): Schema {
    return this.dataSchema.schema;
  }

  // $FlowIssue
  @computed
  get selectedComponents(): SelectedComponents {
    return this.dataSchema.selectedComponents;
  }

  // $FlowIssue
  @computed
  get barChartData(): BarChartData {
    const { chartComponentX, chartComponentY, chartComponentCenter } = this.props.store.chartPanel;

    return this._generateChartData(chartComponentX, chartComponentY, chartComponentCenter);
  }

  _autoSelectComponents = action((selectedComponents: SelectedComponents) => {
    _.assign(
      this.props.store.chartPanel,
      {
        chartComponentX: null,
        chartComponentY: null,
        chartComponentCenter: null,
      },
      selectedComponents,
    );
  });

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
        valueSchemaPath: DEFAULT_AXIS_VALUE_SCHEMA_PATH,
        valueType: 'string',
      };
    } else {
      // use x as default numerical axis
      resultChartComponents.chartComponentX = {
        name: 'x',
        valueSchemaPath: DEFAULT_AXIS_VALUE_SCHEMA_PATH,
        valueType: 'number',
      };
    }

    if (chartComponentY) {
      resultChartComponents.chartComponentY = chartComponentY;
    } else if (!chartComponentX || chartComponentX.valueType === 'string') {
      // use y as default numerical axis
      resultChartComponents.chartComponentY = {
        name: 'y',
        valueSchemaPath: DEFAULT_AXIS_VALUE_SCHEMA_PATH,
        valueType: 'number',
      };
    } else {
      // use y as default categorical axis
      resultChartComponents.chartComponentY = {
        name: 'y',
        valueSchemaPath: DEFAULT_AXIS_VALUE_SCHEMA_PATH,
        valueType: 'string',
      };
    }

    if (chartComponentCenter) {
      resultChartComponents.chartComponentCenter = chartComponentCenter;
    } else {
      // use default center
      resultChartComponents.chartComponentCenter = {
        name: 'center',
        valueSchemaPath: DEFAULT_AXIS_VALUE_SCHEMA_PATH,
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
    const { data } = this.props.store.chartPanel;
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
        categoricalComponent.valueSchemaPath === DEFAULT_AXIS_VALUE_SCHEMA_PATH
          ? ''
          : _.get(v, categoricalComponent.valueSchemaPath, 'other'); // treat missing value as `other`
      const numericalValue =
        numericalComponent.valueSchemaPath === DEFAULT_AXIS_VALUE_SCHEMA_PATH
          ? 1
          : _.get(v, numericalComponent.valueSchemaPath, 0);
      let numericalBin =
        chartComponentCenter.valueSchemaPath === DEFAULT_AXIS_VALUE_SCHEMA_PATH
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
        const size = numericalBinMap.size - (numericalBinMap.has('other') ? 1 : 0);
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
    const selectedComponents = {};

    const schema = this._generateObjectSchema(obj, '', selectedComponents);

    return {
      schema,
      selectedComponents,
    };
  }

  _fillSelectedComponents(
    name: string,
    type: 'string' | 'number',
    schemaPath: string,
    selectedComponents,
  ) {
    if (name.toLowerCase().endsWith('id')) {
      // skip fields end with id
      return;
    }

    let hasSelected = false;

    if (!selectedComponents.chartComponentX) {
      if (
        !selectedComponents.chartComponentY ||
        selectedComponents.chartComponentY.valueType !== type
      ) {
        selectedComponents.chartComponentX = {
          name: 'x',
          valueSchemaPath: schemaPath,
          valueType: type,
        };
        hasSelected = true;
      }
    }

    if (!hasSelected && !selectedComponents.chartComponentY) {
      if (
        !selectedComponents.chartComponentX ||
        selectedComponents.chartComponentX.valueType !== type
      ) {
        selectedComponents.chartComponentY = {
          name: 'y',
          valueSchemaPath: schemaPath,
          valueType: type,
        };
        hasSelected = true;
      }
    }

    if (!hasSelected && !selectedComponents.chartComponentCenter && type === 'string') {
      selectedComponents.chartComponentCenter = {
        name: 'center',
        valueSchemaPath: schemaPath,
        valueType: type,
      };
    }
  }

  _generateObjectSchema(obj: {}, prefix: string, selectedComponents: SelectedComponents) {
    const schema = {};

    _.forOwn(obj, (v: mixed, k: string) => {
      const newPrefix = prefix ? `${prefix}.${k}` : k;

      if (typeof v === 'string') {
        schema[k] = 'string';
        this._fillSelectedComponents(k, 'string', newPrefix, selectedComponents);
      } else if (typeof v === 'number') {
        schema[k] = 'number';
        this._fillSelectedComponents(k, 'number', newPrefix, selectedComponents);
      } else if (typeof v === 'object' && v !== null) {
        schema[k] = this._generateObjectSchema(v, newPrefix, selectedComponents);
      }
    });

    return schema;
  }

  _onSplitPaneResize = _.debounce(
    action((width: number) => {
      const { dataTreeWidth, chartWidth } = this.props.store.chartPanel;

      _.assign(this.props.store.chartPanel, {
        dataTreeWidth: width,
        chartWidth: dataTreeWidth + chartWidth - width,
      });
    }),
    DEBOUNCE_DELAY,
  );

  _onPanelResize = _.debounce(
    action((width: number, height: number) => {
      const { dataTreeWidth } = this.props.store.chartPanel;

      _.assign(this.props.store.chartPanel, {
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
          this.props.store.chartPanel.chartComponentX = { name: 'x', valueSchemaPath, valueType };
        } else if (target === 'y') {
          this.props.store.chartPanel.chartComponentY = { name: 'y', valueSchemaPath, valueType };
        } else {
          this.props.store.chartPanel.chartComponentCenter = {
            name: 'center',
            valueSchemaPath,
            valueType,
          };
        }
      } else {
        this.props.store.chartPanel[`chartComponent${_.upperFirst(target)}`] = null;
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

    const { chartComponentX, chartComponentY, chartComponentCenter } = this.props.store.chartPanel;

    if (chartComponentX && chartComponentX.valueSchemaPath === targetValueSchemaPath) {
      operations.push({
        action: 'unload',
        target: 'x',
      });
    } else if (!chartComponentY || chartComponentY.valueType !== targetValueType) {
      operations.push({
        action: 'load',
        target: 'x',
      });
    }

    if (chartComponentY && chartComponentY.valueSchemaPath === targetValueSchemaPath) {
      operations.push({
        action: 'unload',
        target: 'y',
      });
    } else if (!chartComponentX || chartComponentX.valueType !== targetValueType) {
      operations.push({
        action: 'load',
        target: 'y',
      });
    }

    if (chartComponentCenter && chartComponentCenter.valueSchemaPath === targetValueSchemaPath) {
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
      loading,
    } = this.props.store.chartPanel;

    const { schema, barChartData } = this;

    return (
      <div className="ChartPanel">
        {loading ? (
          <div className="loaderWrapper">
            <div className="loader" />
          </div>
        ) : (
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
              getAllowedChartComponentOperations={this._getAllowedChartComponentOperations}
              chartComponentX={chartComponentX}
              chartComponentY={chartComponentY}
              chartComponentCenter={chartComponentCenter}
            />
            {<BarChart width={chartWidth} height={chartHeight} {...barChartData} />}
          </SplitPane>
        )}
        <ReactResizeDetector
          ref={ref => (this.resizeDetector = ref)}
          className="BarChart"
          handleWidth
          handleHeight
          onResize={this._onPanelResize}
        />
      </div>
    );
  }
}
