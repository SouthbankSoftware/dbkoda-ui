/**
 * @flow
 *
 * @Author: guiguan
 * @Date:   2017-09-21T15:25:12+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-10-07T11:55:11+11:00
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
import type { SelectedComponents } from './Panel';
import './DataTree.scss';

export type Schema = { [string]: string | Schema };
export type ChartComponentOperation = {
  action: 'load' | 'unload',
  target: ChartComponentName,
};
export type ChartComponentChangeHandler = (
  operation: ChartComponentOperation,
  valueSchemaPath: $PropertyType<ChartComponent, 'valueSchemaPath'>,
  valueType: $PropertyType<ChartComponent, 'valueType'>,
) => void;
export type GetAllowedChartComponentOperations = (
  targetValueSchemaPath: string,
  targetValueType: 'string' | 'number',
) => ChartComponentOperation[];
export type DragAndDropHandler = (
  isDragging: boolean,
  valueSchemaPath: ?string,
  valueType: 'string' | 'number' | null,
) => void;
export type SchemaPathTypeChangeHandler = (
  valueSchemaPath: string,
  newValuePath: 'string' | 'number',
) => void;

type Props = {
  schema: Schema,
  chartComponentX: ?ChartComponent,
  chartComponentY: ?ChartComponent,
  chartComponentCenter: ?ChartComponent,
  onChartComponentChange: ChartComponentChangeHandler,
  getAllowedChartComponentOperations: GetAllowedChartComponentOperations,
  onDragAndDrop: DragAndDropHandler,
  onSchemaPathTypeChange: SchemaPathTypeChangeHandler,
};

type State = {
  nodes: ITreeNode[],
};

const dataTreeSource = {
  beginDrag(props) {
    const { valueSchemaPath, valueType, onDragAndDrop } = props;

    onDragAndDrop(true, valueSchemaPath, valueType);

    return {
      valueSchemaPath,
      valueType,
    };
  },

  endDrag(props, monitor) {
    const { valueSchemaPath, valueType, onDragAndDrop, onChartComponentChange } = props;

    if (monitor.didDrop()) {
      const { target } = monitor.getDropResult();
      onChartComponentChange({ action: 'load', target }, valueSchemaPath, valueType);
    }

    onDragAndDrop(false, null, null);
  },
};

// $FlowIssue
@DragSource(DragItemTypes.CHART_DATA_TREE_NODE, dataTreeSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging(),
}))
class DraggableLabel extends React.PureComponent<*> {
  componentDidMount() {
    // Use empty image as a drag preview so browsers don't draw it
    // and we can draw whatever we want on the custom drag layer instead.
    this.props.connectDragPreview(getEmptyImage(), {
      // IE fallback: specify that we'd rather screenshot the node
      // when it already knows it's being dragged so we can hide it with CSS.
      captureDraggingState: true,
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

    const { schema, chartComponentX, chartComponentY, chartComponentCenter } = props;

    this.state = {
      nodes: this._generateTreeNodes(schema, {
        chartComponentX,
        chartComponentY,
        chartComponentCenter,
      }),
    };
  }

  componentWillReceiveProps({
    schema: nextSchema,
    chartComponentX: nextChartComponentX,
    chartComponentY: nextChartComponentY,
    chartComponentCenter: nextChartComponentCenter,
  }: Props) {
    const { schema, chartComponentX, chartComponentY, chartComponentCenter } = this.props;

    if (schema !== nextSchema) {
      // update tree nodes when necessary
      this.setState({
        nodes: this._generateTreeNodes(nextSchema, {
          chartComponentX: nextChartComponentX,
          chartComponentY: nextChartComponentY,
          chartComponentCenter: nextChartComponentCenter,
        }),
      });
    } else {
      this._checkAndUpdateTreeForChartComponent(chartComponentX, nextChartComponentX);
      this._checkAndUpdateTreeForChartComponent(chartComponentY, nextChartComponentY);
      this._checkAndUpdateTreeForChartComponent(chartComponentCenter, nextChartComponentCenter);
    }
  }

  _checkAndUpdateTreeForChartComponent(
    chartComponent: ?ChartComponent,
    nextChartComponent: ?ChartComponent,
  ): void {
    if (!_.isEqual(chartComponent, nextChartComponent)) {
      if (chartComponent) {
        // unload
        const node = this._searchForChartComponent(chartComponent, this.state.nodes);
        if (node != null) {
          node.secondaryLabel = DataTree._removeSecondaryLabel(
            node.secondaryLabel,
            chartComponent.name,
          );
          node.isSelected = Boolean(node.secondaryLabel);
        }
      }
      if (nextChartComponent) {
        // load
        const node = this._searchForChartComponent(nextChartComponent, this.state.nodes);
        if (node != null) {
          node.secondaryLabel = DataTree._addSecondaryLabel(
            node.secondaryLabel,
            nextChartComponent.name,
          );
          node.isSelected = true;
          node.className = nextChartComponent.name;
        }
      }
    }
  }

  _searchForChartComponent(component: ChartComponent, nodes: ?(ITreeNode[])): ?ITreeNode {
    let result: ?ITreeNode = null;

    _.forEach(nodes, (v) => {
      if (v.type === 'object') {
        result = this._searchForChartComponent(component, v.childNodes);
        if (result) {
          return false;
        }
      } else if (v.id === component.valueSchemaPath) {
        result = v;
        return false;
      }
    });

    return result;
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
          '',
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

  _generateTreeNodesInternal(
    schema: Schema,
    prefix: string,
    selectedComponents: SelectedComponents,
  ): { shouldBeExpanded: boolean, nodes: ITreeNode[] } {
    // $FlowIssue
    const nodes: ITreeNode[] = [];
    let shouldBeExpanded = false;

    _.forOwn(schema, (v: string | Schema, k: string) => {
      let node;
      const newPrefix = prefix ? `${prefix}.${k}` : k;
      let secondaryLabel: ?string = null;
      let classname: ?string = null;
      const getSecondaryLabel = () => {
        _.forEach(selectedComponents, (v) => {
          if (v && v.valueSchemaPath === newPrefix) {
            secondaryLabel = (secondaryLabel ? ', ' : '') + DataTree._getSecondaryLabel(v.name);
            shouldBeExpanded = true;
            classname = v.name;
            return false;
          }
        });
      };

      if (typeof v === 'object') {
        const { shouldBeExpanded: childShouldBeExpanded, nodes } = this._generateTreeNodesInternal(
          v,
          newPrefix,
          selectedComponents,
        );
        shouldBeExpanded = shouldBeExpanded || childShouldBeExpanded;
        node = {
          iconName: `pt-icon-folder-${childShouldBeExpanded ? 'open' : 'close'}`,
          isExpanded: childShouldBeExpanded,
          childNodes: nodes,
          type: 'object',
          label: k,
        };
      } else {
        const { onDragAndDrop, onChartComponentChange } = this.props;

        node = {
          hasCaret: false,
          label: (
            <DraggableLabel
              valueSchemaPath={newPrefix}
              valueType={v}
              onDragAndDrop={onDragAndDrop}
              onChartComponentChange={onChartComponentChange}
            >
              {k}
            </DraggableLabel>
          ),
        };

        if (v === 'string') {
          _.assign(node, {
            iconName: 'pt-icon-font',
            type: 'string',
          });
        } else if (v === 'number') {
          _.assign(node, {
            iconName: 'pt-icon-numerical',
            type: 'number',
          });
        } else {
          console.error(`Unsupported data tree node type: ${v}`);
        }

        getSecondaryLabel();
      }

      if (node) {
        _.assign(
          node,
          {
            id: newPrefix,
          },
          secondaryLabel
            ? {
                isSelected: true,
                secondaryLabel,
                className: classname,
              }
            : {},
        );
        nodes.push(node);
      }
    });

    return { shouldBeExpanded, nodes };
  }

  _generateTreeNodes(schema: Schema, selectedComponents: SelectedComponents) {
    return this._generateTreeNodesInternal(schema, '', selectedComponents).nodes;
  }

  _onNodeCollapse = (node: ITreeNode) => {
    node.iconName = 'pt-icon-folder-close';
    node.isExpanded = false;
    this.setState(this.state);
  };

  _onNodeExpand = (node: ITreeNode) => {
    node.iconName = 'pt-icon-folder-open';
    node.isExpanded = true;
    this.setState(this.state);
  };

  _onNodeContextMenu = (node: ITreeNode, _nodePath: number[], e: SyntheticMouseEvent<*>) => {
    e.preventDefault();

    // $FlowFixMe
    const { id, type: valueType } = node;

    if (!valueType || (valueType !== 'string' && valueType !== 'number')) {
      return;
    }

    const valueSchemaPath = String(id);
    const {
      onChartComponentChange,
      getAllowedChartComponentOperations,
      onSchemaPathTypeChange,
    } = this.props;

    const menu = (
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
        <MenuDivider />
        <MenuItem
          onClick={() =>
            onSchemaPathTypeChange(valueSchemaPath, valueType === 'string' ? 'number' : 'string')}
          text={`Treat as ${valueType === 'string' ? 'numerical' : 'categorical'} data`}
        />
      </Menu>
    );

    ContextMenu.show(menu, { left: e.clientX, top: e.clientY });
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
