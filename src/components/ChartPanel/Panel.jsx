/**
 * @flow
 *
 * @Author: guiguan
 * @Date:   2017-09-21T15:25:12+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-10-06T12:28:45+11:00
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
import { action, computed, reaction, runInAction } from 'mobx';
import { inject, observer } from 'mobx-react';
import DataTree, {
  type Schema,
  type ChartComponentChangeHandler,
  type GetAllowedChartComponentOperations,
  type ChartComponentOperation,
  type DragAndDropHandler,
} from './DataTree';
import BarChart, { type ChartData, type ChartComponent } from './BarChart';
import BarChartOverlay from './BarChartOverlay';
import DataTreeDataNodeDragLayer from './DataTreeDataNodeDragLayer';
import './Panel.scss';

const DEBOUNCE_DELAY = 100;
const CATEGORICAL_AXIS_LIMIT = 50;
const CENTER_LIMIT = 20;
const MISSING_CATEGORY_LABEL = '`missing'; // must be unique
export const OTHER_CATEGORY_LABEL = '`other'; // must be unique
export const DEFAULT_AXIS_VALUE_SCHEMA_PATH = '[[DEFAULT]]'; // must be unique

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
type AutoSelectedComponents = {
  chartComponentX?: ChartComponent,
  chartComponentY?: ChartComponent,
  chartComponentCenter?: ChartComponent,
};
type DataSchema = {
  schema: Schema,
  autoSelectedComponents: AutoSelectedComponents,
};

type Store = {
  chartPanel: {
    data: Data,
    dataTreeWidth: number,
    chartWidth: number,
    chartHeight: number,
    chartComponentX: ?ChartComponent | false,
    chartComponentY: ?ChartComponent | false,
    chartComponentCenter: ?ChartComponent | false,
    showOtherInCategoricalAxis: boolean,
    showOtherInCenter: boolean,
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

type State = {
  isDragging: boolean,
  valueSchemaPath: ?string,
  valueType: ?string,
};

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
  barChartGrid: React.ElementRef<*>;

  constructor(props: Props) {
    super(props);

    this.state = {
      isDragging: false,
      valueSchemaPath: null,
      valueType: null,
    };
  }

  componentDidMount() {
    // this.reactions.push(
    //   reaction(
    //     () => this.autoSelectedComponents,
    //     autoSelectedComponents => this._autoSelectComponents(autoSelectedComponents),
    //     // $FlowFixMe
    //     {
    //       fireImmediately: true,
    //     },
    //   ),
    // );

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
  get autoSelectedComponents(): AutoSelectedComponents {
    return this.dataSchema.autoSelectedComponents;
  }

  // $FlowIssue
  @computed
  get _barChartData(): BarChartData {
    const {
      chartComponentX,
      chartComponentY,
      chartComponentCenter,
    } = this._applyAutoSelectedComponents();

    return this._generateChartData(chartComponentX, chartComponentY, chartComponentCenter);
  }

  // $FlowIssue
  @computed
  get barChartData(): BarChartData {
    const { showOtherInCategoricalAxis, showOtherInCenter } = this.props.store.chartPanel;
    const {
      data,
      componentX,
      componentY,
      componentCenter: { name, valueSchemaPath, valueType, values },
    } = this._barChartData;
    const categoricalComponent = this._getCategoricalNumericalComponents(componentX, componentY)[0];
    let resultData;
    let resultComponentCenter;

    if (
      !showOtherInCategoricalAxis &&
      data.length > 0 &&
      _.last(data)[categoricalComponent.name] === OTHER_CATEGORY_LABEL
    ) {
      resultData = data.slice(0, data.length - 1);
    } else {
      resultData = data;
    }

    // $FlowFixMe
    if (!showOtherInCenter && values.length > 0 && _.last(values) === OTHER_CATEGORY_LABEL) {
      resultComponentCenter = {
        name,
        valueSchemaPath,
        valueType,
        // $FlowIssue
        values: values.slice(0, values.length - 1),
      };
    } else {
      resultComponentCenter = this._barChartData.componentCenter;
    }

    return {
      data: resultData,
      componentX,
      componentY,
      componentCenter: resultComponentCenter,
    };
  }

  _applyAutoSelectedComponents = (
    updateStore = false,
  ): {
    chartComponentX: ?ChartComponent,
    chartComponentY: ?ChartComponent,
    chartComponentCenter: ?ChartComponent,
  } => {
    const { chartComponentX, chartComponentY, chartComponentCenter } = this.props.store.chartPanel;

    if (chartComponentX === false && chartComponentY === false && chartComponentCenter === false) {
      // use auto selection
      const result = _.assign(
        {
          chartComponentX: null,
          chartComponentY: null,
          chartComponentCenter: null,
        },
        this.autoSelectedComponents,
      );

      if (updateStore) {
        // update mobx store here

        // make sure we update after render to preserve unidirectional data flow
        setTimeout(() => {
          const msg = 'Auto select chart components';
          console.debug(msg);
          runInAction(msg, () => {
            _.assign(this.props.store.chartPanel, result);
          });
        });
      }

      return result;
    }

    const falseToNull = comp => (comp === false ? null : comp);

    return {
      chartComponentX: falseToNull(chartComponentX),
      chartComponentY: falseToNull(chartComponentY),
      chartComponentCenter: falseToNull(chartComponentCenter),
    };
  };

  _getComponentsForBarChart(
    chartComponentX: ?ChartComponent | false,
    chartComponentY: ?ChartComponent | false,
    chartComponentCenter: ?ChartComponent | false,
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

  _getCategoricalNumericalComponents(
    chartComponentX: ChartComponent,
    chartComponentY: ChartComponent,
  ): [
    { name: 'x' | 'y', valueSchemaPath: string, valueType: 'number' | 'string' },
    { name: 'x' | 'y', valueSchemaPath: string, valueType: 'number' | 'string' },
  ] {
    return chartComponentX.valueType === 'string'
      ? // $FlowIssue
        [chartComponentX, chartComponentY]
      : // $FlowIssue
        [chartComponentY, chartComponentX];
  }

  /**
   * Generate chart data using following heuristics:
   * 1. keep principal components, i.e. top categories and center categories
   * 2. sort categories and center categories based on earliness in linear scan, so collocation of
   * category A and center category B closer to chart origin means earlier appearance in original
   * JSON array
   */
  _generateChartData(
    x: ?ChartComponent | false,
    y: ?ChartComponent | false,
    center: ?ChartComponent | false,
  ): BarChartData {
    const { data } = this.props.store.chartPanel;
    const {
      chartComponentX,
      chartComponentY,
      chartComponentCenter,
    } = this._getComponentsForBarChart(x, y, center);
    const [categoricalComponent, numericalComponent] = this._getCategoricalNumericalComponents(
      chartComponentX,
      chartComponentY,
    );

    /* scan through data to build categorical axis map */
    type Center = {
      value: number,
      order: number, // creation order, indicates its earliness
    };
    type CategoricalAxis = {
      centerMap: Map<string, Center>,
      centerSum: number,
      order: number, // creation order, indicates its earliness
    };

    let categoricalAxisMap: Map<string, CategoricalAxis> = new Map();
    let hasOtherInCategoricalAxis = false;
    let categoricalAxisSum = 0;
    let currSum = 0;

    _.forEach(data, (v) => {
      const categoricalValue =
        categoricalComponent.valueSchemaPath === DEFAULT_AXIS_VALUE_SCHEMA_PATH
          ? ''
          : _.get(v, categoricalComponent.valueSchemaPath, MISSING_CATEGORY_LABEL);
      const numericalValue =
        numericalComponent.valueSchemaPath === DEFAULT_AXIS_VALUE_SCHEMA_PATH
          ? 1
          : _.get(v, numericalComponent.valueSchemaPath, 0);
      const numericalBin =
        chartComponentCenter.valueSchemaPath === DEFAULT_AXIS_VALUE_SCHEMA_PATH
          ? DEFAULT_AXIS_VALUE_SCHEMA_PATH
          : _.get(v, chartComponentCenter.valueSchemaPath, MISSING_CATEGORY_LABEL);

      categoricalAxisSum += numericalValue;

      const categoricalAxis = categoricalAxisMap.get(categoricalValue);
      if (categoricalAxis !== undefined) {
        const { centerMap } = categoricalAxis;

        categoricalAxis.centerSum += numericalValue;

        const center = centerMap.get(numericalBin);
        if (center !== undefined) {
          center.value += numericalValue;
        } else {
          const newCenter = {
            value: numericalValue,
            order: centerMap.size,
          };

          centerMap.set(numericalBin, newCenter);
        }
      } else {
        const newEntry = {
          centerMap: new Map([
            [
              numericalBin,
              {
                value: numericalValue,
                order: 0,
              },
            ],
          ]),
          centerSum: numericalValue,
          order: categoricalAxisMap.size,
        };

        categoricalAxisMap.set(categoricalValue, newEntry);
      }
    });

    /* keep principal components */
    let categoricalAxes: { ['x' | 'y']: any }[] = [];
    // transform to outmost chart data shape
    for (const [k, v] of categoricalAxisMap.entries()) {
      categoricalAxes.push({
        [categoricalComponent.name]: k, // ready
        [numericalComponent.name]: v, // not ready
      });
    }
    // $FlowIssue
    categoricalAxisMap = null; // recycle map to reduce memory footprint

    if (categoricalAxes.length > CATEGORICAL_AXIS_LIMIT) {
      // keep top CATEGORICAL_AXIS_LIMIT categorical axes

      hasOtherInCategoricalAxis = true;
      categoricalAxes = _.sortBy(categoricalAxes, v => v[numericalComponent.name].centerSum);
      categoricalAxes = _.takeRight(categoricalAxes, CATEGORICAL_AXIS_LIMIT);
      categoricalAxes = _.sortBy(categoricalAxes, (v) => {
        const { centerSum, order } = v[numericalComponent.name];

        currSum += centerSum;
        return order;
      });
    }

    /* derive center categories */
    let centerCategoryMap: Map<
      string,
      {
        sum: number,
        earliness: number,
      },
    > = new Map();
    for (const categoricalAxis of categoricalAxes) {
      const { centerMap, order: categoricalAxisOrder } = categoricalAxis[numericalComponent.name];

      for (const [k, center] of centerMap.entries()) {
        const centerCategory = centerCategoryMap.get(k);
        const { value, order: centerOrder } = center;

        if (centerCategory !== undefined) {
          centerCategory.sum += value;
          centerCategory.earliness += categoricalAxisOrder + centerOrder;
        } else {
          const newCenterCategory = {
            sum: value,
            earliness: categoricalAxisOrder + centerOrder,
          };

          centerCategoryMap.set(k, newCenterCategory);
        }
      }
    }
    let centerCategories = [...centerCategoryMap.entries()];
    // $FlowIssue
    centerCategoryMap = null; // recycle map to reduce memory footprint
    if (centerCategories.length > CENTER_LIMIT) {
      // keep top CENTER_LIMIT center categories
      centerCategories = _.sortBy(centerCategories, v => v[1].sum);
      centerCategories = _.takeRight(centerCategories, CENTER_LIMIT);
      centerCategories = _.sortBy(centerCategories, v => v[1].earliness);
    }

    /* derive chart data */
    let hasOtherInCenter = false;
    centerCategories = _.map(centerCategories, v => v[0]);
    const centerCategorySet = new Set(centerCategories); // use set for membership checking
    // efficiency
    _.forEach(categoricalAxes, (axis) => {
      const { centerMap, centerSum } = axis[numericalComponent.name];
      const centerObj = {};

      let currSum = 0;

      for (const [k, v] of centerMap) {
        if (centerCategorySet.has(k)) {
          centerObj[k] = v.value;
          currSum += v.value;
        }
      }

      if (currSum < centerSum) {
        // need to show `other` category in center
        centerObj[OTHER_CATEGORY_LABEL] = centerSum - currSum;
        hasOtherInCenter = true;
      }

      axis[numericalComponent.name] = centerObj;
    });

    if (hasOtherInCategoricalAxis) {
      hasOtherInCenter = true;
      categoricalAxes.push({
        [categoricalComponent.name]: OTHER_CATEGORY_LABEL,
        [numericalComponent.name]: {
          [OTHER_CATEGORY_LABEL]: categoricalAxisSum - currSum,
        },
      });
    }

    if (hasOtherInCenter) {
      centerCategories.push(OTHER_CATEGORY_LABEL);
    }

    chartComponentCenter.values = centerCategories;

    return {
      data: categoricalAxes,
      componentX: chartComponentX,
      componentY: chartComponentY,
      componentCenter: chartComponentCenter,
    };
  }

  _generateDataSchema(data: Data) {
    const obj = _.head(data);
    const autoSelectedComponents = {};

    const schema = this._generateObjectSchema(obj, '', autoSelectedComponents);

    return {
      schema,
      autoSelectedComponents,
    };
  }

  _fillAutoSelectedComponents(
    name: string,
    type: 'string' | 'number',
    schemaPath: string,
    autoSelectedComponents,
  ) {
    if (name.toLowerCase().endsWith('id')) {
      // skip fields end with id
      return;
    }

    let hasSelected = false;

    if (!autoSelectedComponents.chartComponentX) {
      if (
        !autoSelectedComponents.chartComponentY ||
        autoSelectedComponents.chartComponentY.valueType !== type
      ) {
        autoSelectedComponents.chartComponentX = {
          name: 'x',
          valueSchemaPath: schemaPath,
          valueType: type,
        };
        hasSelected = true;
      }
    }

    if (!hasSelected && !autoSelectedComponents.chartComponentY) {
      if (
        !autoSelectedComponents.chartComponentX ||
        autoSelectedComponents.chartComponentX.valueType !== type
      ) {
        autoSelectedComponents.chartComponentY = {
          name: 'y',
          valueSchemaPath: schemaPath,
          valueType: type,
        };
        hasSelected = true;
      }
    }

    if (!hasSelected && !autoSelectedComponents.chartComponentCenter && type === 'string') {
      autoSelectedComponents.chartComponentCenter = {
        name: 'center',
        valueSchemaPath: schemaPath,
        valueType: type,
      };
    }
  }

  _generateObjectSchema(obj: {}, prefix: string, autoSelectedComponents: AutoSelectedComponents) {
    const schema = {};

    _.forOwn(obj, (v: mixed, k: string) => {
      const newPrefix = prefix ? `${prefix}.${k}` : k;

      if (typeof v === 'string') {
        schema[k] = 'string';
        this._fillAutoSelectedComponents(k, 'string', newPrefix, autoSelectedComponents);
      } else if (typeof v === 'number') {
        schema[k] = 'number';
        this._fillAutoSelectedComponents(k, 'number', newPrefix, autoSelectedComponents);
      } else if (typeof v === 'object' && v !== null) {
        schema[k] = this._generateObjectSchema(v, newPrefix, autoSelectedComponents);
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
    } else if (
      (!chartComponentY || chartComponentY.valueType !== targetValueType) &&
      (!chartComponentCenter || chartComponentCenter.valueSchemaPath !== targetValueSchemaPath)
    ) {
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
    } else if (
      (!chartComponentX || chartComponentX.valueType !== targetValueType) &&
      (!chartComponentCenter || chartComponentCenter.valueSchemaPath !== targetValueSchemaPath)
    ) {
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
    } else if (
      targetValueType === 'string' &&
      (!chartComponentX || chartComponentX.valueSchemaPath !== targetValueSchemaPath) &&
      (!chartComponentY || chartComponentY.valueSchemaPath !== targetValueSchemaPath)
    ) {
      operations.push({
        action: 'load',
        target: 'center',
      });
    }

    return operations;
  };

  _setBarChartGrid = (ref: React.ElementRef<*>) => {
    this.barChartGrid = ref;
  };

  _getBarChartGrid = (): React.ElementRef<*> => {
    return this.barChartGrid;
  };

  _onDragAndDrop: DragAndDropHandler = (isDragging, valueSchemaPath, valueType) => {
    this.setState({
      isDragging,
      valueSchemaPath,
      valueType,
    });
  };

  _onToggleShowOtherInCategoricalAxis = action(() => {
    const { chartPanel } = this.props.store;
    chartPanel.showOtherInCategoricalAxis = !chartPanel.showOtherInCategoricalAxis;
  });

  _onToggleShowOtherInCenter = action(() => {
    const { chartPanel } = this.props.store;
    chartPanel.showOtherInCenter = !chartPanel.showOtherInCenter;
  });

  render() {
    const {
      dataTreeWidth,
      chartWidth,
      chartHeight,
      showOtherInCategoricalAxis,
      showOtherInCenter,
      loading,
    } = this.props.store.chartPanel;

    const { schema, barChartData } = this;
    const { isDragging, valueSchemaPath, valueType } = this.state;

    const {
      chartComponentX,
      chartComponentY,
      chartComponentCenter,
    } = this._applyAutoSelectedComponents(true);

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
              onDragAndDrop={this._onDragAndDrop}
              chartComponentX={chartComponentX}
              chartComponentY={chartComponentY}
              chartComponentCenter={chartComponentCenter}
            />
            <div>
              <BarChart
                width={chartWidth}
                height={chartHeight}
                setBarChartGrid={this._setBarChartGrid}
                showOtherInCategoricalAxis={showOtherInCategoricalAxis}
                showOtherInCenter={showOtherInCenter}
                onToggleShowOtherInCategoricalAxis={this._onToggleShowOtherInCategoricalAxis}
                onToggleShowOtherInCenter={this._onToggleShowOtherInCenter}
                {...barChartData}
              />
              {isDragging ? (
                <BarChartOverlay
                  getBarChartGrid={this._getBarChartGrid}
                  getAllowedChartComponentOperations={this._getAllowedChartComponentOperations}
                  valueSchemaPath={valueSchemaPath}
                  valueType={valueType}
                />
              ) : null}
            </div>
          </SplitPane>
        )}
        <DataTreeDataNodeDragLayer />
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
