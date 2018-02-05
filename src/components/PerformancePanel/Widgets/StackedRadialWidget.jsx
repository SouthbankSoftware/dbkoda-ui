/**
 * Created by joey on 17/1/18.
 * @Last modified by:   wahaj
 * @Last modified time: 2018-02-01T17:15:23+11:00
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
import { inject, observer } from 'mobx-react';
import { action } from 'mobx';

import _ from 'lodash';
import { Intent, Tooltip, Position } from '@blueprintjs/core';
import './StackedRadialWidget.scss';
import Widget from './Widget';
import Legend from './Legend';
import { Broker, EventType } from '../../../helpers/broker';

@inject(({ store, api }, { widget }) => {
  return {
    store,
    api,
    widget
  };
})
@observer
/**
 * TODO: @joey please enable flow
 */
export default class StackedRadialWidget extends React.Component {
  static colors = [
    '#3333cc',
    '#2E547A',
    '#643798',
    '#39B160',
    '#DC5D3E',
    '#A27EB7'
  ];
  static width = 50;
  static height = 50;
  static PI = 2 * Math.PI;

  constructor(props) {
    super(props);
    this.state = {
      width: StackedRadialWidget.width,
      height: StackedRadialWidget.height,
      lastLayerTweened: { key: '', index: 1 }
    };
    this.fields = [];
    this.itemValues = [];
    this.field = null;
    if (this.props.widget.items.length > 3) {
      this.scaleFactor = 2;
    } else {
      this.scaleFactor = 1;
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
    if (layer > 1) {
      return this.state.width / (12 * this.scaleFactor) * layer - 1;
    }
    return this.state.width / (12 * this.scaleFactor);
  }

  _getOuterRadiusSize(layer: number) {
    const minValue = Math.min(this.state.width, this.state.height);
    return this._getInnerRadiusSize(layer) + minValue / (16 * this.scaleFactor);
  }

  buildWidget(selector: string, layer: number, data) {
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

    let xTranslate = this.state.width / 2;
    xTranslate -= parseInt(this.state.width * 0.175, 10);

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
          console.debug('Layer ', layer, ' tooltip is ', key);
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
      .attr('stop-color', StackedRadialWidget.colors[layer - 1])
      .attr('stop-opacity', 1);

    gradient
      .append('svg:stop')
      .attr('offset', '100%')
      .attr('stop-color', StackedRadialWidget.colors[layer - 1])
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
      .attr('filter', 'url(#dropshadow)');

    // render background
    field
      .append('path')
      .attr('class', 'bg')
      .style('fill', StackedRadialWidget.colors[layer - 1])
      .style('opacity', 0.2)
      .attr('d', background);

    // field.append('text').attr('class', 'icon');
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

  arcTween(d) {
    const i = d3.interpolateNumber(d.previousValue, d.percentage);

    return t => {
      d.percentage = i(t);
      return this.arc(d)(d);
    };
  }

  arc(data) {
    return d3
      .arc()
      .startAngle(0)
      .endAngle(d => {
        return d.percentage / 100 * StackedRadialWidget.PI;
      })
      .innerRadius(this._getInnerRadiusSize(data.index))
      .outerRadius(this._getOuterRadiusSize(data.index))
      .cornerRadius(
        (this._getOuterRadiusSize(data.index) -
          this._getInnerRadiusSize(data.index)) /
          2
      );
  }

  /**
   * When new data is recieved, update the relevant ring.
   */
  update(field) {
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
      // .ease('elastic')
      .attrTween('d', this.arcTween.bind(this))
      .style('fill', 'url(#gradient)');

    // Get total sum of radials.
    let sumOfItems = 0;
    for (const key in this.itemValues) {
      if (this.itemValues.hasOwnProperty(key)) {
        sumOfItems += this.itemValues[key];
      }
    }

    // Reduce Radial to 3 figures max.
    if (sumOfItems > 999) {
      sumOfItems =
        Number.parseFloat((sumOfItems /= 1000)).toPrecision(3) + 'k/s';
    } else if (sumOfItems > 999) {
      sumOfItems =
        Number.parseFloat((sumOfItems /= 1000000)).toPrecision(3) + 'M/s';
    }

    if (field.layer === 1) {
      field.field.select('text.completed').text(() => {
        return sumOfItems + '/s';
      });
      field.field
        .select('text.completed')
        .attr('transform', 'translate(0, 0), scale(0.5, 0.5)');
    }

    field.field
      .select('title')
      .attr('transform', 'translate(0, 0), scale(0.5, 0.5)');
  }

  _onData = action(payload => {
    const { timestamp, value } = payload;
    const { items, values } = this.props.widget;

    values.replace([
      {
        timestamp,
        value: _.pick(value, items)
      }
    ]);
    const latestValue =
      values.length > 0 ? values[values.length - 1].value : {};
    this.itemValues = [];
    if (!_.isEmpty(latestValue)) {
      Object.keys(latestValue).map(key => {
        const fixedValue = _.isInteger(latestValue[key])
          ? latestValue[key]
          : parseInt(latestValue[key], 10);
        this.itemValues[key] = fixedValue;
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
    }
  });

  componentDidMount() {
    const { profileId } = this.props.widget;
    Broker.on(EventType.STATS_DATA(profileId), this._onData.bind(this));
    this.fields = [];
    this.props.widget.items.forEach((item, count) => {
      this.buildWidget('.radial-' + parseInt(count + 1, 10), count + 1, item);
    });
  }

  _onResize = (width: number, height: number) => {
    this.setState({
      width,
      height
    });
  };

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
    const { widget } = this.props;
    const { displayName } = widget;
    this.fields = [];
    this.props.widget.items.forEach((item, count) => {
      this.buildWidget('.radial-' + parseInt(count + 1, 10), count + 1, item);
    });
    const wrapperStyle = { width: this.state.width * 0.66 };
    return (
      <Widget widget={widget} onResize={this._onResize}>
        <div
          className="StackedRadialWidget"
          ref={radial => (this.radial = radial)}
        >
          <div className="radialWrapper" style={wrapperStyle}>
            <div className="display-name">{displayName}</div>
            {this.props.widget.items.map((item, count) => {
              const tooltipStyle = this.determineTooltipStyling(count + 1);
              const classes =
                'radial radial-' + (count + 1) + ' ' + (count + 1) + ' item';
              return (
                <div className={classes}>
                  <div className="tooltip-wrapper" style={tooltipStyle}>
                    {' '}
                    <Tooltip
                      intent={Intent.PRIMARY}
                      style={tooltipStyle}
                      hoverOpenDelay={1000}
                      inline
                      content={item}
                      tooltipClassName="pt-dark"
                      position={Position.BOTTOM}
                    >
                      <div />
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>
          <Legend
            showTotal
            metrics={this.props.widget.items}
            onRef={legend => {
              this.legend = legend;
            }}
          />
        </div>
      </Widget>
    );
  }
}
