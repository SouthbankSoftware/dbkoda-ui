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

import './StackedRadialWidget.scss';
import Widget from './Widget';
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
  static colors = ['#3333cc'];
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
    console.log(this.props.widget.items);
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

    const svg = elem
      .select(selector)
      .append('svg')
      .attr('width', this.state.width)
      .attr('height', this.state.height)
      .append('g')
      .attr(
        'transform',
        'translate(' + this.state.width / 2 + ',' + this.state.height / 2 + ')'
      );

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
      .attr('stop-color', '#BD4133')
      .attr('stop-opacity', 1);

    gradient
      .append('svg:stop')
      .attr('offset', '100%')
      .attr('stop-color', '#8A4148')
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
      .style('fill', StackedRadialWidget.colors[0])
      .style('opacity', 0.2)
      .attr('d', background);

    // field.append('text').attr('class', 'icon');
    const yTranslation = -100 + 35 * (layer - 1);
    field
      .append('text')
      .attr('class', 'completed')
      .attr('transform', 'scale(0.5, 0.5)')
      .attr('transform', 'translate(100, ' + parseInt(yTranslation, 10) + ')');

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

    field.field.select('text.completed').text(d => {
      return d.percentage + '%';
    });
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
  });

  componentDidMount() {
    const { profileId } = this.props.widget;
    Broker.on(EventType.STATS_DATA(profileId), this._onData.bind(this));
    this.fields = [];
    this.props.widget.items.forEach((item, count) => {
      this.buildWidget('.radial-' + parseInt(count + 1, 10), count + 1, item);
    });
    // this.buildWidget('.radial-1', 1, 'memory');
    // this.buildWidget('.radial-2', 2, 'disk');
    // this.buildWidget('.radial-3', 3, 'cpu');
  }

  _onResize = (width: number, height: number) => {
    this.setState({
      width,
      height
    });
  };

  render() {
    const { widget } = this.props;
    const { displayName } = widget;
    this.fields = [];
    this.props.widget.items.forEach((item, count) => {
      this.buildWidget('.radial-' + parseInt(count + 1, 10), count + 1, item);
    });
    console.log(this.props.widget.items);
    return (
      <Widget widget={widget} onResize={this._onResize}>
        <div
          className="StackedRadialWidget"
          ref={radial => (this.radial = radial)}
        >
          <div className="display-name">{displayName}</div>
          {this.props.widget.items.map((item, count) => {
            console.log('Building: ', item);
            const classes =
              'radial radial-' + (count + 1) + ' ' + (count + 1) + ' item';
            return <div className={classes} />;
          })}
        </div>
      </Widget>
    );
  }
}
