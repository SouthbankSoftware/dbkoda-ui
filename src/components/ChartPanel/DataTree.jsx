/**
 * @flow
 *
 * @Author: guiguan
 * @Date:   2017-09-21T15:25:12+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-09-27T16:42:21+10:00
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
import { type ITreeNode, Tree, ContextMenu, Menu, MenuItem } from '@blueprintjs/core';
import escapeStringRegexp from 'escape-string-regexp';
import type { ChartComponent, ChartComponentName } from './BarChart';
import './DataTree.scss';

export type Schema = { [string]: string };
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

type Props = {
  schema: Schema,
  chartComponentX: ?ChartComponent,
  chartComponentY: ?ChartComponent,
  chartComponentCenter: ?ChartComponent,
  onChartComponentChange: ChartComponentChangeHandler,
  getAllowedChartComponentOperations: GetAllowedChartComponentOperations,
};

type State = {
  nodes: ITreeNode[],
};

export default class DataTree extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { schema } = props;

    this.state = {
      nodes: this._generateTreeNodes(schema),
    };
  }

  componentWillReceiveProps({
    schema: nextSchema,
    chartComponentX: nextChartComponentX,
    chartComponentY: nextChartComponentY,
    chartComponentCenter: nextChartComponentCenter,
  }: Props) {
    const { schema, chartComponentX, chartComponentY, chartComponentCenter } = this.props;

    if (!_.isEqual(schema, nextSchema)) {
      // update tree nodes when necessary
      this.setState({
        nodes: this._generateTreeNodes(nextSchema),
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
        }
      }
    }
  }

  _searchForChartComponent(component: ChartComponent, nodes: ?ITreeNode[]): ?ITreeNode {
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
  ): { shouldBeExpanded: boolean, nodes: ITreeNode[] } {
    // $FlowIssue
    const nodes: ITreeNode[] = [];
    let shouldBeExpanded = false;

    _.forOwn(schema, (v: string | Schema, k: string) => {
      let node;
      const newPrefix = prefix ? `${prefix}.${k}` : k;
      let secondaryLabel: ?string = null;
      const getSecondaryLabel = () => {
        const { chartComponentX, chartComponentY, chartComponentCenter } = this.props;
        _.forEach([chartComponentX, chartComponentY, chartComponentCenter], (v) => {
          if (v && v.valueSchemaPath === newPrefix) {
            secondaryLabel = (secondaryLabel ? ', ' : '') + DataTree._getSecondaryLabel(v.name);
            shouldBeExpanded = true;
            return false;
          }
        });
      };

      if (typeof v === 'object') {
        const { shouldBeExpanded: childShouldBeExpanded, nodes } = this._generateTreeNodesInternal(
          v,
          newPrefix,
        );
        shouldBeExpanded = shouldBeExpanded || childShouldBeExpanded;
        node = {
          iconName: 'pt-icon-folder-close',
          isExpanded: childShouldBeExpanded,
          childNodes: nodes,
          type: 'object',
        };
      } else if (v === 'string') {
        node = {
          hasCaret: false,
          iconName: 'pt-icon-font',
          type: 'string',
        };
        getSecondaryLabel();
      } else if (v === 'number') {
        node = {
          hasCaret: false,
          iconName: 'pt-icon-numerical',
          type: 'number',
        };
        getSecondaryLabel();
      }

      if (node) {
        _.assign(
          node,
          {
            id: newPrefix,
            label: k,
          },
          secondaryLabel
            ? {
                isSelected: true,
                secondaryLabel,
              }
            : {},
        );
        nodes.push(node);
      }
    });

    return { shouldBeExpanded, nodes };
  }

  _generateTreeNodes(schema: Schema) {
    return this._generateTreeNodesInternal(schema, '').nodes;
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

    if (!node.type) {
      return;
    }

    const { id } = node;
    const { onChartComponentChange, getAllowedChartComponentOperations } = this.props;
    const type = node.type;

    if (type !== 'string' && type !== 'number') {
      return;
    }

    const menu = (
      <Menu>
        {_.map(getAllowedChartComponentOperations(String(id), type), (v, i) => {
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
              onClick={() => {
                onChartComponentChange(v, String(id), type);
              }}
              text={text}
            />
          );
        })}
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
