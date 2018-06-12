/**
 * @flow
 *
 * @Author: guiguan
 * @Date:   2017-09-21T15:25:12+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2018-06-12T10:56:30+10:00
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
import _ from 'lodash';
import { type ITreeNode, Tree, ContextMenu, Menu, MenuItem, MenuDivider } from '@blueprintjs/core';
import escapeStringRegexp from 'escape-string-regexp';
import { DragSource } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
// $FlowFixMe
import { DragItemTypes } from '#/common/Constants.js';
import type { ChartComponent, ChartComponentName } from './BarChart';
import type { SchemaRef } from './Panel';
import './DataTree.scss';

export type Schema = {
  [string]: | {
        path: string,
        type: 'string' | 'number',
        dataTreePath: ?string // updated by DataTree
      }
    | {
        path: string,
        type: 'object',
        dataTreePath: ?string, // updated by DataTree
        isExpanded: boolean, // updated by Panel & DataTree
        childSchema: Schema
      }
};
export type ChartComponentOperation = {
  action: 'load' | 'unload',
  target: ChartComponentName | 'all'
};
export type ChartComponentChangeHandler = (
  operation: ChartComponentOperation,
  valueSchemaPath: ?$PropertyType<ChartComponent, 'valueSchemaPath'>,
  valueType: ?$PropertyType<ChartComponent, 'valueType'>
) => void;
export type GetAllowedChartComponentOperations = (
  targetValueSchemaPath: string,
  targetValueType: 'string' | 'number'
) => ChartComponentOperation[];
export type DragAndDropHandler = (
  isDragging: boolean,
  valueSchemaPath: ?string,
  valueType: 'string' | 'number' | null
) => void;
export type SchemaPathTypeChangeHandler = (
  valueSchemaPath: string,
  newValuePath: 'string' | 'number'
) => void;

type Props = {
  schemaRef: SchemaRef,
  chartComponentX: ?ChartComponent,
  chartComponentY: ?ChartComponent,
  chartComponentCenter: ?ChartComponent,
  onChartComponentChange: ChartComponentChangeHandler,
  getAllowedChartComponentOperations: GetAllowedChartComponentOperations,
  onDragAndDrop: DragAndDropHandler,
  onSchemaPathTypeChange: SchemaPathTypeChangeHandler
};

type State = {
  nodes: ITreeNode[]
};

const dataTreeSource = {
  beginDrag(props) {
    const { valueSchemaPath, valueType, onDragAndDrop } = props;

    onDragAndDrop(true, valueSchemaPath, valueType);

    return {
      valueSchemaPath,
      valueType
    };
  },

  endDrag(props, monitor) {
    const { valueSchemaPath, valueType, onDragAndDrop, onChartComponentChange } = props;

    if (monitor.didDrop()) {
      const { target, action } = monitor.getDropResult();
      onChartComponentChange({ action, target }, valueSchemaPath, valueType);
    }

    onDragAndDrop(false, null, null);
  }
};

// $FlowIssue
@DragSource(DragItemTypes.CHART_DATA_TREE_NODE, dataTreeSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging()
}))
class DraggableLabel extends React.PureComponent<*> {
  componentDidMount() {
    // Use empty image as a drag preview so browsers don't draw it
    // and we can draw whatever we want on the custom drag layer instead.
    this.props.connectDragPreview(getEmptyImage(), {
      // IE fallback: specify that we'd rather screenshot the node
      // when it already knows it's being dragged so we can hide it with CSS.
      captureDraggingState: true
    });
  }

  render() {
    const { connectDragSource, children } = this.props;

    return connectDragSource(<span className="DraggableLabel">{children}</span>);
  }
}

export default class DataTree extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const {
      schemaRef: { schema },
      chartComponentX,
      chartComponentY,
      chartComponentCenter
    } = props;
    const nodes = this._buildTreeFromSchema(schema);
    this._checkAndUpdateTreeForChartComponent(null, chartComponentX, schema, nodes);
    this._checkAndUpdateTreeForChartComponent(null, chartComponentY, schema, nodes);
    this._checkAndUpdateTreeForChartComponent(null, chartComponentCenter, schema, nodes);

    this.state = {
      nodes
    };
  }

  componentWillReceiveProps({
    schemaRef: nextSchemaRef,
    chartComponentX: nextChartComponentX,
    chartComponentY: nextChartComponentY,
    chartComponentCenter: nextChartComponentCenter
  }: Props) {
    const {
      schemaRef: prevSchemaRef,
      chartComponentX,
      chartComponentY,
      chartComponentCenter
    } = this.props;

    let nodes;
    let schema;
    let loadOnly = false;

    if (prevSchemaRef !== nextSchemaRef) {
      const { schema: nextSchema } = nextSchemaRef;
      // update tree nodes when necessary
      nodes = this._buildTreeFromSchema(nextSchema);
      schema = nextSchema;
      loadOnly = true;
    } else {
      ({ nodes } = this.state);
      ({ schema } = prevSchemaRef);
    }

    this._checkAndUpdateTreeForChartComponent(
      loadOnly ? null : chartComponentX,
      nextChartComponentX,
      schema,
      nodes
    );
    this._checkAndUpdateTreeForChartComponent(
      loadOnly ? null : chartComponentY,
      nextChartComponentY,
      schema,
      nodes
    );
    this._checkAndUpdateTreeForChartComponent(
      loadOnly ? null : chartComponentCenter,
      nextChartComponentCenter,
      schema,
      nodes
    );

    this.setState({
      nodes
    });
  }

  _checkAndUpdateTreeForChartComponent(
    chartComponent: ?ChartComponent,
    nextChartComponent: ?ChartComponent,
    schema: Schema,
    nodes: ITreeNode[]
  ): void {
    if (!_.isEqual(chartComponent, nextChartComponent)) {
      if (chartComponent) {
        // unload
        const node = this._getTreeNodeForChartComponent(chartComponent, schema, nodes);
        if (node != null) {
          node.secondaryLabel = DataTree._removeSecondaryLabel(
            node.secondaryLabel,
            chartComponent.name
          );
          node.isSelected = Boolean(node.secondaryLabel);
        }
      }
      if (nextChartComponent) {
        // load
        const node = this._getTreeNodeForChartComponent(nextChartComponent, schema, nodes);
        if (node != null) {
          node.secondaryLabel = DataTree._addSecondaryLabel(
            node.secondaryLabel,
            nextChartComponent.name
          );
          node.isSelected = true;
          node.className = nextChartComponent.name;
        }
      }
    }
  }

  _getTreeNodeForChartComponent(
    component: ChartComponent,
    schema: Schema,
    nodes: ITreeNode[]
  ): ?ITreeNode {
    const { valueSchemaPath } = component;

    const dataTreePath = _.get(schema, `${valueSchemaPath}.dataTreePath`);
    if (!dataTreePath) {
      l.error('Missing dataTreePath in schema');
      return null;
    }

    return _.get(nodes, dataTreePath, null);
  }

  static _addSecondaryLabel(label: ?string, target: ChartComponentName): string {
    const result = label || '';
    const newLabel = DataTree._getSecondaryLabel(target);
    return result ? result + ', ' + newLabel : newLabel;
  }

  static _removeSecondaryLabel(label: ?string, target: ChartComponentName): ?string {
    if (!label) {
      return null;
    }

    return (
      label
        .replace(
          new RegExp(`(?:, )?${escapeStringRegexp(DataTree._getSecondaryLabel(target))}`, 'g'),
          ''
        )
        .replace(/^, /, '') || null
    );
  }

  static _getSecondaryLabel(target: ChartComponentName): string {
    if (target === 'x') {
      return 'X axis';
    } else if (target === 'y') {
      return 'Y axis';
    }
    return 'Center';
  }

  _buildTreeFromSchema = (schema: Schema, prefix: string = ''): ITreeNode[] => {
    // $FlowIssue
    const nodes: ITreeNode[] = [];
    let index = 0;

    _.forOwn(schema, (v, k: string) => {
      const { path, type } = v;
      let node;
      const newPrefix = prefix ? `${prefix}.${index}` : `${index}`;

      if (type === 'object') {
        const { isExpanded, childSchema } = v;

        const nodes = this._buildTreeFromSchema(childSchema, `${newPrefix}.childNodes`);
        node = {
          icon: `folder-${isExpanded ? 'open' : 'close'}`,
          isExpanded,
          childNodes: nodes,
          type,
          label: k
        };
      } else {
        const { onDragAndDrop, onChartComponentChange } = this.props;

        node = {
          hasCaret: false,
          label: (
            <DraggableLabel
              valueSchemaPath={path}
              valueType={type}
              onDragAndDrop={onDragAndDrop}
              onChartComponentChange={onChartComponentChange}
            >
              {k}
            </DraggableLabel>
          )
        };

        if (type === 'string') {
          _.assign(node, {
            icon: 'font',
            type: 'string'
          });
        } else if (type === 'number') {
          _.assign(node, {
            icon: 'numerical',
            type: 'number'
          });
        } else {
          _.assign(node, {
            icon: 'error',
            type
          });
          l.error(`Unsupported data tree node type: ${v}`);
        }
      }

      v.dataTreePath = newPrefix;
      index += 1;

      _.assign(node, {
        id: path
      });
      nodes.push(node);
    });

    return nodes;
  };

  _onNodeCollapse = (node: ITreeNode) => {
    const {
      schemaRef: { schema }
    } = this.props;
    const { id } = node;

    const schemaNode = _.get(schema, String(id));
    if (schemaNode) {
      schemaNode.isExpanded = false;
    } else {
      l.error('Missing schema node');
    }

    node.icon = 'folder-close';
    node.isExpanded = false;
    this.setState(this.state);
  };

  _onNodeExpand = (node: ITreeNode) => {
    const {
      schemaRef: { schema }
    } = this.props;
    const { id } = node;

    const schemaNode = _.get(schema, String(id));
    if (schemaNode) {
      schemaNode.isExpanded = true;
    } else {
      l.error('Missing schema node');
    }

    node.icon = 'folder-open';
    node.isExpanded = true;
    this.setState(this.state);
  };

  _onNodeContextMenu = (node: ITreeNode, _nodePath: number[], e: SyntheticMouseEvent<*>) => {
    e.preventDefault();

    // $FlowFixMe
    const { id, type: valueType } = node;
    let menu;

    const createUnloadAllMenuItem = () => {
      const { onChartComponentChange } = this.props;

      return (
        <MenuItem
          onClick={() => onChartComponentChange({ action: 'unload', target: 'all' }, null, null)}
          text="Unload all"
        />
      );
    };

    if (!valueType || (valueType !== 'string' && valueType !== 'number')) {
      const { chartComponentX, chartComponentY, chartComponentCenter } = this.props;

      if (chartComponentX || chartComponentY || chartComponentCenter) {
        menu = <Menu>{createUnloadAllMenuItem()}</Menu>;
      }
    } else {
      const valueSchemaPath = String(id);
      const {
        chartComponentX,
        chartComponentY,
        chartComponentCenter,
        onChartComponentChange,
        getAllowedChartComponentOperations,
        onSchemaPathTypeChange
      } = this.props;

      let shouldShowUnloadAllMenuItem;

      if (!(chartComponentX || chartComponentY || chartComponentCenter)) {
        shouldShowUnloadAllMenuItem = false;
      } else {
        shouldShowUnloadAllMenuItem = true;

        const components = [chartComponentX, chartComponentY, chartComponentCenter];

        outer: for (let i = 0; i < components.length; i += 1) {
          const component = components[i];
          if (component && component.valueSchemaPath === valueSchemaPath) {
            for (let j = 0; j < components.length; j += 1) {
              if (j !== i && components[j]) {
                break outer;
              }
            }
            shouldShowUnloadAllMenuItem = false;
            break;
          }
        }
      }

      menu = (
        <Menu>
          {_.map(getAllowedChartComponentOperations(valueSchemaPath, valueType), (v, i) => {
            let compDesc;

            if (v.target === 'x') {
              compDesc = 'X axis';
            } else if (v.target === 'y') {
              compDesc = 'Y axis';
            } else {
              compDesc = 'center';
            }

            let text;

            if (v.action === 'load') {
              text = `Load to ${compDesc}`;
            } else {
              text = `Unload from ${compDesc}`;
            }

            return (
              <MenuItem
                key={i}
                onClick={() => onChartComponentChange(v, valueSchemaPath, valueType)}
                text={text}
              />
            );
          })}
          {shouldShowUnloadAllMenuItem ? createUnloadAllMenuItem() : null}
          <MenuDivider />
          <MenuItem
            onClick={() =>
              onSchemaPathTypeChange(valueSchemaPath, valueType === 'string' ? 'number' : 'string')
            }
            text={`Treat as ${valueType === 'string' ? 'numerical' : 'categorical'} data`}
          />
        </Menu>
      );
    }

    if (menu) {
      ContextMenu.show(menu, { left: e.clientX, top: e.clientY });
    }
  };

  render() {
    const { nodes } = this.state;

    return (
      <div className="DataTree">
        <Tree
          contents={nodes}
          onNodeCollapse={this._onNodeCollapse}
          onNodeExpand={this._onNodeExpand}
          onNodeContextMenu={this._onNodeContextMenu}
        />
      </div>
    );
  }
}
