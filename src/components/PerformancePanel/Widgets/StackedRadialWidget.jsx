/**
 * @flow
 * Created by mike on 06/02/2018
 * @Last modified by:   guiguan
 * @Last modified time: 2018-03-22T17:31:09+11:00
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

import * as d3 from 'd3';
import React from 'react';
import { observer } from 'mobx-react';
import { action, autorun } from 'mobx';
import _ from 'lodash';
import { PopoverInteractionKind } from '@blueprintjs/core';
// $FlowFixMe
import { Popover2 } from '@blueprintjs/labs';
import type { WidgetState } from '~/api/Widget';
import type { PerformancePanelState } from '~/api/PerformancePanel';
import './StackedRadialWidget.scss';
import { convertUnits } from './Utils';
import Widget from './Widget';
import Legend from './Legend';

const colors = ['#AC8BC0', '#E26847', '#42BB6D', '#7040A3', '#365F87'];

type Props = {
  performancePanel: PerformancePanelState,
  widget: WidgetState,
  widgetStyle: *
};

type State = {
  width: number,
  height: number,
  lastLayerTweened: *
};

@observer
export default class StackedRadialWidget extends React.Component<Props, State> {
  static width = 60;
  static height = 60;
  static minRadius = 10;
  static ringGapScaleFactor = 14;
  static xTranslateScale = 0.14;
  static yTranslateScale = 10;
  static PI = 2 * Math.PI;

  state: any;
  fields: Array<Object>;
  itemValues: Object;
  field: *;
  scaleFactor: number;
  legend: any;
  tooltipLegend: any;
  radial: Object;
  colors: Array<string>;
  maxValues: Array<*>;
  maxValue: number;
  _autorunDisposer: *;
  dataset: () => Array<Object>;
  toolTipLegend: *;

  constructor(props: Props) {
    super(props);
    this.state = {
      width: StackedRadialWidget.width,
      height: StackedRadialWidget.height,
      lastLayerTweened: { key: '', index: 1 }
    };
    if (this.props.widget.colorList) {
      this.colors = this.props.widget.colorList;
    } else {
      this.colors = colors;
    }
    // $FlowFixMe
    this.fields = [];
    // $FlowFixMe
    this.itemValues = [];
    this.maxValues = [];
    this.field = null;
    if (this.props.widget.items.length > 3) {
      this.scaleFactor = 2;
    } else {
      this.scaleFactor = 1.5;
    }
    this.dataset = () => {
      if (!this.itemValues[this.state.lastLayerTweened.key]) {
        return [
          {
            index: 0,
            name: 'move',
            icon: '\uF105',
            percentage: 0
          }
        ];
      }
      return [
        {
          index: this.state.lastLayerTweened.index,
          name: 'move',
          icon: '\uF105',
          percentage: this.itemValues[this.state.lastLayerTweened.key]
        }
      ];
    };
  }

  _getInnerRadiusSize(layer: number) {
    const minValue = Math.min(this.state.width, this.state.height);
    if (layer > 1) {
      // Layer X inner should be equal to layer X-1 outer.
      return (
        this._getInnerRadiusSize(layer - 1) +
        minValue / (StackedRadialWidget.ringGapScaleFactor * this.scaleFactor)
      );
    }
    return (
      StackedRadialWidget.minRadius + this.state.width / (8 * this.scaleFactor)
    );
  }

  _getOuterRadiusSize(layer: number) {
    const minValue = Math.min(this.state.width, this.state.height);
    return this._getInnerRadiusSize(layer) + minValue / (16 * this.scaleFactor);
  }

  buildWidget(selector: string, layer: number, data: String) {
    const background = d3
      .arc()
      .startAngle(0)
      .endAngle(StackedRadialWidget.PI)
      .innerRadius(this._getInnerRadiusSize(layer))
      .outerRadius(this._getOuterRadiusSize(layer));

    const elem = d3.select(this.radial);
    elem
      .select(selector)
      .selectAll('svg')
      .remove();
    d3.transition();

    let xTranslate = 0;
    if (this.props.widget.showLegend) {
      xTranslate += parseInt(
        this._getOuterRadiusSize(this.props.widget.items.length) +
          this.state.width * StackedRadialWidget.xTranslateScale,
        10
      );
    } else {
      xTranslate += parseInt(
        this._getOuterRadiusSize(this.props.widget.items.length) +
          this.state.width,
        10
      );
    }

    // For smaller screen width, move radial left to make more room for legend.
    if (this.state.width < 300) {
      xTranslate = 65;
    }

    const svg = elem
      .select(selector)
      .append('svg')
      .attr('width', this.state.width)
      .attr('height', this.state.height)
      .append('g')
      .attr(
        'transform',
        'translate(' + xTranslate + ',' + this.state.height / 2 + ')'
      );

    let tooltip = '?';
    let count = 0;
    for (const key in this.itemValues) {
      if (this.itemValues.hasOwnProperty(key)) {
        count += 1;
        if (count === layer) {
          tooltip = key;
        }
      }
    }
    svg.append('svg:title').text(tooltip);

    // Gradient.
    const gradient = svg
      .append('svg:defs')
      .append('svg:linearGradient')
      .attr('id', 'gradient')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '50%')
      .attr('y2', '0%')
      .attr('spreadMethod', 'pad');

    gradient
      .append('svg:stop')
      .attr('offset', '0%')
      .attr('stop-color', this.colors[layer - 1])
      .attr('stop-opacity', 1);

    gradient
      .append('svg:stop')
      .attr('offset', '100%')
      .attr('stop-color', this.colors[layer - 1])
      .attr('stop-opacity', 1);

    // Drop Shadows
    const defs = svg.append('defs');

    const filter = defs.append('filter').attr('id', 'dropshadow');

    filter
      .append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 4)
      .attr('result', 'blur');
    filter
      .append('feOffset')
      .attr('in', 'blur')
      .attr('dx', 1)
      .attr('dy', 1)
      .attr('result', 'offsetBlur');

    const feMerge = filter.append('feMerge');

    feMerge.append('feMergeNode').attr('in', 'offsetBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const field = svg
      .selectAll('g')
      .data(this.dataset)
      .enter()
      .append('g');

    field
      .append('path')
      .attr('class', 'progress')
      .attr('fill', this.colors[layer - 1]);

    // render background
    field
      .append('path')
      .attr('class', 'bg')
      .style('fill', this.colors[layer - 1])
      .style('opacity', 0.1)
      .attr('d', background);

    const yTranslation = -100 + 35 * (layer - 1);
    field
      .append('text')
      .attr('class', 'completed')
      .attr('transform', 'scale(0.1, 0.1)')
      .attr('transform', 'translate(100, ' + parseInt(yTranslation, 10) + ')');

    // Add tooltip.

    this.fields.push({ field, layer, data });
    this.field = field;
    d3
      .transition()
      .duration(1000)
      .each(() => this.update({ field, layer, data }));

    return field;
  }

  arcTween(d: any) {
    const i = d3.interpolateNumber(d.previousValue, d.percentage);
    // $FlowFixMe
    return t => {
      d.percentage = i(t);
      // $FlowFixMe
      return this.arc(d)(d);
    };
  }

  arc(data: any) {
    try {
      return d3
        .arc()
        .startAngle(0)
        .endAngle(d => {
          let returnValue = 0;
          if (!this.maxValue) {
            this.maxValue = d.percentage;
          }
          if (this.props.widget.unit === '%') {
            returnValue = d.percentage / 100 * StackedRadialWidget.PI;
            if (isNaN(returnValue)) return 0;
            return returnValue;
          }
          if (this.maxValue === 0) {
            return 0;
          }
          returnValue = d.percentage / this.maxValue * StackedRadialWidget.PI;
          if (isNaN(returnValue)) return 0;
          return returnValue;
        })
        .innerRadius(this._getInnerRadiusSize(data.index))
        .outerRadius(this._getOuterRadiusSize(data.index))
        .cornerRadius(
          (this._getOuterRadiusSize(data.index) -
            this._getInnerRadiusSize(data.index)) /
            2
        );
    } catch (e) {
      console.error('Caught Error: ', e);
    }
  }

  /**
   * When new data is recieved, update the relevant ring.
   */
  update(field: Object) {
    this.state.lastLayerTweened = { key: field.data, index: field.layer };
    field.field = field.field
      .each(function(d) {
        this._value = d.percentage;
      })
      .data(this.dataset)
      .each(function(d) {
        d.previousValue = this._value;
      });

    // Draw
    field.field
      .select('path.progress')
      .transition()
      .duration(1000)
      .attrTween('d', this.arcTween.bind(this));

    // Get total sum of radials.
    let sumOfItems = 0;
    for (const key in this.itemValues) {
      if (this.itemValues.hasOwnProperty(key)) {
        sumOfItems += this.itemValues[key];
      }
    }

    // Check if it's the highest value ever.
    // if (!this.maxValue || this.maxValue < sumOfItems) {
    //   this.maxValue = sumOfItems;
    //  }

    if (field.layer === 1) {
      let lblValue;
      let yTranslate = '0';
      if (this.props.widget.unit === '%') yTranslate = '14';
      field.field.select('text.completed').text(() => {
        if (this.props.widget.unit === '%') {
          if (this.itemValues[field.data]) {
            return this.itemValues[field.data] + '%';
          }
          return '0%';
        } else if (this.props.widget.unit === 'Us') {
          lblValue = convertUnits(sumOfItems, this.props.widget.unit, 3);
          return lblValue.value + ' ' + lblValue.unit;
        }
        // $FlowFixMe
        lblValue = convertUnits(sumOfItems, this.props.widget.unit, 3);
        return lblValue.value + ' ' + lblValue.unit;
      });
      field.field
        .select('text.completed')
        .attr('transform', 'translate(0, ' + yTranslate + '), scale(0.4, 0.4)');
    }

    if (this.props.widget.unit === '%' && field.layer === 2) {
      let lblValue;
      field.field.select('text.completed').text(() => {
        if (this.props.widget.unit === '%') {
          if (this.itemValues[field.data]) {
            return this.itemValues[field.data] + '%';
          }
          return '0%';
        } else if (this.props.widget.unit === 'Us') {
          lblValue = convertUnits(sumOfItems, this.props.widget.unit, 3);

          return lblValue.value + ' ' + lblValue.unit;
        }
        // $FlowFixMe
        lblValue = convertUnits(sumOfItems, this.props.widget.unit, 3);
        return lblValue.value + ' ' + lblValue.unit;
      });
      field.field
        .select('text.completed')
        .attr('transform', 'translate(0, 0), scale(0.4, 0.4)');
    }

    field.field
      .select('title')
      .attr('transform', 'translate(0, 0), scale(0.5, 0.5)');
  }

  @action.bound
  updateD3Graphs = action(latestValue => {
    const { stats } = this.props.performancePanel;
    // $FlowFixMe
    this.itemValues = [];
    this.maxValue = 0;
    if (!_.isEmpty(latestValue)) {
      Object.keys(latestValue).map(key => {
        const fixedValue = _.isInteger(latestValue[key])
          ? latestValue[key]
          : parseInt(latestValue[key], 10);
        // If fixedValue is null, give a 0 value so it will render straight away.
        this.itemValues[key] = fixedValue;
        const { hwm } = stats[key];
        this.maxValue = parseInt(
          Math.max(hwm, fixedValue, this.maxValue, 0),
          10
        );
      });

      this.fields.map(field => {
        Object.keys(latestValue).map(key => {
          if (field.data === key) {
            this.update(field);
          }
        });
      });
    }
    if (this.legend) {
      this.legend.setValues(this.itemValues);
      if (this.toolTipLegend) {
        // $FlowFixMe
        this.toolTipLegend.setValues(this.itemValues);
      }
    }
  });

  getMaximumValueFromHistory(
    values: Array<Object>,
    item: string,
    key: string
  ): number {
    let prev = null;
    let max = 0;
    values.forEach(value => {
      const v = value.value[item][key];
      if (prev !== null) {
        const diff = Math.abs(prev - v);
        if (diff > max) {
          max = diff;
        }
      }
      prev = v;
    });
    return max;
  }

  componentWillUnmount() {
    this._autorunDisposer && this._autorunDisposer();
    // TODO: cleanup d3?
  }

  componentDidMount() {
    setTimeout(() => {
      this.fields = [];
      this.props.widget.items.forEach((item, count) => {
        // $FlowFixMe
        this.buildWidget('.radial-' + parseInt(count + 1, 10), count + 1, item);
      });
      this._autorunDisposer = autorun(() => {
        const { items, values } = this.props.widget;

        const latestValue =
          values.length > 0 ? values[values.length - 1].value : {};
        if (items.length == 1) {
          console.error(
            'Please use Radial and not StackedRadial for single item metrics.'
          );
          return;
        }
        if (latestValue === undefined) return;

        this.updateD3Graphs(latestValue);
      });
    }, 200);
  }

  _onResize = (width: number, height: number) => {
    if (this.legend) {
      this.legend.resize(width, height);
    }
    this.setState({
      width: width - 20,
      height: height - 20
    });
    this._rebuildOnResize();
  };

  _rebuildOnResize() {
    this.props.widget.items.forEach((item, count) => {
      // $FlowFixMe
      this.buildWidget('.radial-' + parseInt(count + 1, 10), count + 1, item);
    });
  }

  /**
   * Used to dynamically style the element so a tooltip can be overlayed on it.
   * @param {int} count - The layer being rendered, this will determine the scale and position.
   */
  determineTooltipStyling(count: number) {
    return {
      color: 'white',
      position: 'absolute',
      width: this.state.width * count / 4.25,
      height: this.state.width * count / 4.25,
      zIndex: 10 - count,
      left:
        'calc(50% - ' +
        this.state.width * count / 4.25 / 2 +
        'px - ' +
        this.state.width * 0.175 +
        'px)',
      top: 'calc(50% - ' + this.state.width * count / 4.25 / 2 + 'px)'
    };
  }

  render() {
    const { widget, widgetStyle } = this.props;
    const { displayName } = widget;

    const wrapperStyle = { width: this.state.width * 0.55 };

    // $FlowIssue
    return (
      <Widget
        widget={widget}
        widgetStyle={widgetStyle}
        onResize={this._onResize}
      >
        <div
          className="StackedRadialWidget"
          // $FlowFixMe
          ref={radial => (this.radial = radial)}
        >
          <Popover2
            minimal
            interactionKind={PopoverInteractionKind.HOVER}
            popoverClassName="StackedRadialWidgetTooltip toolTip"
            // $FlowIssue
            content={
              <div className="Tooltip">
                <Legend
                  showTotal
                  showValues
                  colors={this.colors}
                  showDots
                  unit={this.props.widget.unit}
                  metrics={this.props.widget.items}
                  getValues={() => {
                    return this.itemValues;
                  }}
                  getUnit={() => {
                    return this.props.widget.unit;
                  }}
                  onRef={toolTipLegend => {
                    // $FlowFixMe
                    this.toolTipLegend = toolTipLegend;
                  }}
                />
              </div>
            }
            target={
              <div className="radialWrapper" style={wrapperStyle}>
                <div className="display-name">{displayName}</div>
                {this.props.widget.items.map((item, count) => {
                  const key = item + count;
                  const classes =
                    'radial radial-' +
                    (count + 1) +
                    ' ' +
                    (count + 1) +
                    ' item';
                  return <div key={key} className={classes} />;
                })}
              </div>
            }
          />

          {widget.showLegend && (
            // $FlowFixMe
            <Legend
              showTotal={false}
              showValues={false}
              colors={this.colors}
              unit={this.props.widget.unit}
              showDots
              metrics={this.props.widget.items}
              onRef={legend => {
                this.legend = legend;
              }}
            />
          )}
        </div>
      </Widget>
    );
  }
}
