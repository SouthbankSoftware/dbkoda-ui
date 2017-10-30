/**
 * @flow
 *
 * @Author: guiguan
 * @Date:   2017-09-21T15:25:12+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-10-10T21:43:19+11:00
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
import shallowEqualObjects from 'shallow-equal/objects';
import { inject, observer } from 'mobx-react';
// $FlowIssue
import ErrorView from '#/common/ErrorView';
// $FlowIssue
import { Broker, EventType } from '~/helpers/broker';
// $FlowIssue
import LoadingView from '#/common/LoadingView';
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
const CATEGORICAL_AXIS_LIMIT = 60;
const CENTER_LIMIT = 20;
const SCHEMA_SAMPLING_PERCENTAGE = 10; // 10%
const MISSING_CATEGORY_LABEL = '`missing'; // must be unique
export const OTHER_CATEGORY_LABEL = '`other'; // must be unique
export const DEFAULT_AXIS_VALUE_SCHEMA_PATH = '[[DEFAULT]]'; // must be unique
const CLEAN_SCHEMA_PATH_REGEX = /\.childSchema/g;

export function getDisplaySchemaPath(schemaPath: string) {
  return schemaPath.replace(CLEAN_SCHEMA_PATH_REGEX, '');
}

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
export type SelectedComponents = {
  chartComponentX: ?ChartComponent,
  chartComponentY: ?ChartComponent,
  chartComponentCenter: ?ChartComponent,
};
type DataSchema = {
  schema: Schema,
  autoSelectedComponents: SelectedComponents,
};
export type SchemaRef = {
  schema: Schema,
};
export type ChartPanelStore = {
  data: Data,
  schemaRef: SchemaRef,
  dataTreeWidth: number,
  chartWidth: number,
  chartHeight: number,
  chartComponentX: ?ChartComponent | false,
  chartComponentY: ?ChartComponent | false,
  chartComponentCenter: ?ChartComponent | false,
  showOtherInCategoricalAxis: boolean,
  showOtherInCenter: boolean,
  state: ComponentState,
  error: ?string,
};

type Store = {
  chartPanel: ChartPanelStore,
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

class SampleResultLeaf {
  string: number = 0;
  number: number = 0;

  constructor(srcType: 'string' | 'number') {
    // $FlowIssue
    this[srcType] += 1;
  }
}

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
  fetchNumValueRegex = /[^\d.+-]/g;

  constructor(props: Props) {
    super(props);

    this.state = {
      isDragging: false,
      valueSchemaPath: null,
      valueType: null,
    };
  }

  componentDidMount() {
    Broker.emit(EventType.FEATURE_USE, 'ChartView');
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
  get schemaRef(): SchemaRef {
    const { schemaRef } = this.props.store.chartPanel;

    if (schemaRef) {
      return schemaRef;
    }

    const { schema } = this.dataSchema;
    const newSchemaRef = {
      schema,
    };
    setTimeout(() => (this.schemaRef = newSchemaRef));
    return newSchemaRef;
  }
  set schemaRef(schemaRef: SchemaRef) {
    const { chartPanel } = this.props.store;

    chartPanel.schemaRef = schemaRef;
  }

  // $FlowIssue
  @computed.equals(shallowEqualObjects)
  get selectedComponents(): SelectedComponents {
    const { chartComponentX, chartComponentY, chartComponentCenter } = this.props.store.chartPanel;

    if (chartComponentX === false && chartComponentY === false && chartComponentCenter === false) {
      // use auto selection
      const result = this.dataSchema.autoSelectedComponents;

      // make sure we update after render to preserve unidirectional data flow
      setTimeout(() => (this.selectedComponents = result));

      return result;
    }

    // $FlowFixMe
    return {
      chartComponentX,
      chartComponentY,
      chartComponentCenter,
    };
  }
  set selectedComponents(selectedComponents: SelectedComponents) {
    _.assign(this.props.store.chartPanel, selectedComponents);
  }

  // $FlowIssue
  @computed
  get _barChartData(): BarChartData {
    const { chartComponentX, chartComponentY, chartComponentCenter } = this.selectedComponents;

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
    const categoricalComponentDataPath = getDisplaySchemaPath(categoricalComponent.valueSchemaPath);
    const numericalComponentDataPath = getDisplaySchemaPath(numericalComponent.valueSchemaPath);
    const chartComponentCenterDataPath = getDisplaySchemaPath(chartComponentCenter.valueSchemaPath);

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

    const fetchNumValue = (doc, dataPath, defaultValue) => {
      let result = _.get(doc, dataPath, defaultValue);
      if (!_.isNumber(result)) {
        result = String(result).replace(this.fetchNumValueRegex, '');
        result = _.toNumber(result);
      }
      return _.isFinite(result)
        ? result
        : defaultValue; /* treat Infinity, -Infinity and NaN as defaultValue */
    };

    const fetchStrValue = (doc, dataPath, defaultValue) =>
      String(_.get(doc, dataPath, defaultValue));

    const fetchValues = (doc): [string, number, string] => {
      const categoricalValue =
        categoricalComponentDataPath === DEFAULT_AXIS_VALUE_SCHEMA_PATH
          ? ''
          : fetchStrValue(doc, categoricalComponentDataPath, MISSING_CATEGORY_LABEL);
      const numericalValue =
        numericalComponentDataPath === DEFAULT_AXIS_VALUE_SCHEMA_PATH
          ? 1
          : fetchNumValue(doc, numericalComponentDataPath, 0);
      const numericalBin =
        chartComponentCenterDataPath === DEFAULT_AXIS_VALUE_SCHEMA_PATH
          ? DEFAULT_AXIS_VALUE_SCHEMA_PATH
          : fetchStrValue(doc, chartComponentCenterDataPath, MISSING_CATEGORY_LABEL);

      return [categoricalValue, numericalValue, numericalBin];
    };

    _.forEach(data, (v) => {
      const [categoricalValue, numericalValue, numericalBin] = fetchValues(v);

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

  _sampleData(data: Data): {} {
    const size = data.length;
    const result = {};

    if (size === 0) {
      return result;
    }

    const sampleSize = Math.max(Math.round(size * SCHEMA_SAMPLING_PERCENTAGE / 100), 1);
    const step = Math.floor(size / sampleSize);

    for (let i = 0; i * step < size; i += 1) {
      _.mergeWith(result, data[i], (objValue, srcValue) => {
        let srcType = typeof srcValue;

        if (srcType === 'object' && srcValue !== null) {
          return undefined;
        }

        srcType = srcType === 'number' ? srcType : 'string'; // treat all other types as strings

        if (objValue === undefined) {
          return new SampleResultLeaf(srcType);
        }

        objValue[srcType] += 1;

        return objValue;
      });
    }

    return result;
  }

  _generateDataSchema(data: Data) {
    const sampleResults = this._sampleData(data);
    const autoSelectedComponents = {
      chartComponentX: null,
      chartComponentY: null,
      chartComponentCenter: null,
    };

    const [, schema] = this._generateObjectSchema(sampleResults, '', autoSelectedComponents);

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
  ): ?ChartComponent {
    if (name.toLowerCase().endsWith('id')) {
      // skip fields end with id
      return null;
    }

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
        return autoSelectedComponents.chartComponentX;
      }
    }

    if (!autoSelectedComponents.chartComponentY) {
      if (
        !autoSelectedComponents.chartComponentX ||
        autoSelectedComponents.chartComponentX.valueType !== type
      ) {
        autoSelectedComponents.chartComponentY = {
          name: 'y',
          valueSchemaPath: schemaPath,
          valueType: type,
        };
        return autoSelectedComponents.chartComponentY;
      }
    }

    if (!autoSelectedComponents.chartComponentCenter && type === 'string') {
      autoSelectedComponents.chartComponentCenter = {
        name: 'center',
        valueSchemaPath: schemaPath,
        valueType: type,
      };
      return autoSelectedComponents.chartComponentCenter;
    }
  }

  _generateObjectSchema(
    sampleResults: {},
    prefix: string,
    autoSelectedComponents: SelectedComponents,
  ): [boolean, Schema] {
    const schema = {};
    let shouldBeExpanded = false;

    _.forOwn(sampleResults, (v: mixed, k: string) => {
      const newPrefix = prefix ? `${prefix}.${k}` : k;

      if (v instanceof SampleResultLeaf) {
        const { string, number } = v;
        const type = string >= number ? 'string' : 'number';

        const selectedCompnent = this._fillAutoSelectedComponents(
          k,
          // $FlowIssue
          type,
          newPrefix,
          autoSelectedComponents,
        );

        shouldBeExpanded = shouldBeExpanded || !!selectedCompnent;

        schema[k] = {
          path: newPrefix,
          type,
          dataTreePath: null,
        };
      } else {
        const [childShouldBeExpanded, childSchema] = this._generateObjectSchema(
          // $FlowIssue
          v,
          `${newPrefix}.childSchema`,
          autoSelectedComponents,
        );

        shouldBeExpanded = shouldBeExpanded || childShouldBeExpanded;

        schema[k] = {
          path: newPrefix,
          type: 'object',
          dataTreePath: null,
          isExpanded: childShouldBeExpanded,
          childSchema,
        };
      }
    });

    return [shouldBeExpanded, schema];
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
      const { chartPanel } = this.props.store;
      const { action, target } = operation;

      if (action === 'load') {
        const { chartComponentX, chartComponentY, chartComponentCenter } = chartPanel;
        const components = [chartComponentX, chartComponentY, chartComponentCenter];

        for (const c of components) {
          if (c && c.name !== target && c.valueSchemaPath === valueSchemaPath) {
            // unload
            chartPanel[`chartComponent${_.upperFirst(c.name)}`] = null;
          }
        }

        chartPanel[`chartComponent${_.upperFirst(target)}`] = {
          name: target,
          valueSchemaPath,
          valueType,
        };
      } else if (target === 'all') {
        _.assign(chartPanel, {
          chartComponentX: null,
          chartComponentY: null,
          chartComponentCenter: null,
        });
      } else {
        chartPanel[`chartComponent${_.upperFirst(target)}`] = null;
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
      !chartComponentY ||
      chartComponentY.valueType !== targetValueType ||
      chartComponentY.valueSchemaPath === targetValueSchemaPath
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
      !chartComponentX ||
      chartComponentX.valueType !== targetValueType ||
      chartComponentX.valueSchemaPath === targetValueSchemaPath
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
    } else if (targetValueType === 'string') {
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

  _onSchemaPathTypeChange = action((valueSchemaPath, newType) => {
    const { chartPanel } = this.props.store;
    const { chartComponentX, chartComponentY, chartComponentCenter, schemaRef } = chartPanel;

    // update selected components
    for (const c of [chartComponentX, chartComponentY, chartComponentCenter]) {
      if (c && c.valueSchemaPath === valueSchemaPath) {
        if ((c.name === 'x' && !chartComponentY) || (c.name === 'y' && !chartComponentX)) {
          chartPanel[`chartComponent${_.upperFirst(c.name)}`] = _.assign(_.clone(c), {
            valueType: newType,
          });
          continue;
        }
        chartPanel[`chartComponent${_.upperFirst(c.name)}`] = null;
        break;
      }
    }

    // add to type filter
    const { schema } = schemaRef;
    const schemaPath = `${valueSchemaPath}.type`;
    if (_.has(schema, schemaPath)) {
      _.set(schema, schemaPath, newType);
      this.schemaRef = { schema };
    } else {
      console.error('Unexpected schema inconsistency');
    }
  });

  render() {
    const {
      dataTreeWidth,
      chartWidth,
      chartHeight,
      showOtherInCategoricalAxis,
      showOtherInCenter,
      state,
      error,
    } = this.props.store.chartPanel;

    const { schemaRef, barChartData } = this;
    const { isDragging, valueSchemaPath, valueType } = this.state;

    const { chartComponentX, chartComponentY, chartComponentCenter } = this.selectedComponents;

    return (
      <div className="ChartPanel">
        {state !== 'loaded' ? (
          state === 'loading' ? (
            <LoadingView />
          ) : (
            <ErrorView error={error} />
          )
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
              schemaRef={schemaRef}
              onChartComponentChange={this._onChartComponentChange}
              getAllowedChartComponentOperations={this._getAllowedChartComponentOperations}
              onDragAndDrop={this._onDragAndDrop}
              onSchemaPathTypeChange={this._onSchemaPathTypeChange}
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
