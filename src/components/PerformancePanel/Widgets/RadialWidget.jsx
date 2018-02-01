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
import {inject, observer} from 'mobx-react';
import {action} from 'mobx';
import _ from 'lodash';

import './RadialWidget.scss';
import Widget from './Widget';
import {Broker, EventType} from '../../../helpers/broker';

@inject(({ store, api}, {widget}) => {
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
export default class RadialWidget extends React.Component {
  static colors = ['#8A4148'];
  static width = 500;
  static height = 500;
  static PI = 2 * Math.PI;

  constructor(props) {
    super(props);
    this.state = {width: RadialWidget.width, height: RadialWidget.height};
    this.itemValue = 0;
    this.field = null;
    this.dataset = () => {
      return [
        {index: 0, name: 'move', icon: '\uF105', percentage: this.itemValue}
      ];
    };
  }

  _getInnerRadiusSize() {
    return this.state.width / 3;
  }

  _getOuterRadiusSize() {
    const minValue = Math.min(this.state.width, this.state.height);
    return this._getInnerRadiusSize() + minValue / 10;
  }

  buildWidget() {
    const background = d3.arc()
      .startAngle(0)
      .endAngle(RadialWidget.PI)
      .innerRadius(this._getInnerRadiusSize())
      .outerRadius(this._getOuterRadiusSize());

    const elem = d3.select(this.radial);
    elem.select('.radial-main').selectAll('svg').remove();
    d3.transition();

    const svg = elem.select('.radial-main').append('svg')
      .attr('width', this.state.width)
      .attr('height', this.state.height)
      .append('g')
      .attr('transform', 'translate(' + this.state.width / 2 + ',' + this.state.height / 2 + ')');

    // add linear gradient, notice apple uses gradient alone the arc..
    // meh, close enough...


    const gradient = svg.append('svg:defs')
      .append('svg:linearGradient')
      .attr('id', 'gradient')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '50%')
      .attr('y2', '0%')
      .attr('spreadMethod', 'pad');

    gradient.append('svg:stop')
      .attr('offset', '0%')
      .attr('stop-color', '#BD4133')
      .attr('stop-opacity', 1);

    gradient.append('svg:stop')
      .attr('offset', '100%')
      .attr('stop-color', '#8A4148')
      .attr('stop-opacity', 1);


    // add some shadows
    const defs = svg.append('defs');

    const filter = defs.append('filter')
      .attr('id', 'dropshadow');

    filter.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 4)
      .attr('result', 'blur');
    filter.append('feOffset')
      .attr('in', 'blur')
      .attr('dx', 1)
      .attr('dy', 1)
      .attr('result', 'offsetBlur');

    const feMerge = filter.append('feMerge');

    feMerge.append('feMergeNode')
      .attr('in', 'offsetBlur');
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');

    const field = svg.selectAll('g')
      .data(this.dataset)
      .enter().append('g');

    field.append('path').attr('class', 'progress').attr('filter', 'url(#dropshadow)');

    // render background
    field.append('path').attr('class', 'bg')
      .style('fill', RadialWidget.colors[0])
      .style('opacity', 0.2)
      .attr('d', background);

    // field.append('text').attr('class', 'icon');

    field.append('text').attr('class', 'completed').attr('transform', 'translate(0,0)');
    this.field = field;
    d3.transition().duration(1000).each(() => this.update());

    return field;
  }

  arcTween(d) {
    const i = d3.interpolateNumber(d.previousValue, d.percentage);
    return (t) => {
      d.percentage = i(t);
      return this.arc()(d);
    };
  }

  arc() {
    return d3.arc()
      .startAngle(0)
      .endAngle((d) => {
        return d.percentage / 100 * RadialWidget.PI;
      })
      .innerRadius(this._getInnerRadiusSize())
      .outerRadius(this._getOuterRadiusSize())
      .cornerRadius((this._getOuterRadiusSize() - this._getInnerRadiusSize()) / 2);
  }


  update() {
    this.field = this.field
      .each(function (d) {
        this._value = d.percentage;
      })
      .data(this.dataset)
      .each(function (d) {
        d.previousValue = this._value;
      });

    this.field.select('path.progress').transition().duration(1000)
    // .ease('elastic')
      .attrTween('d', this.arcTween.bind(this))
      .style('fill', 'url(#gradient)');

    this.field.select('text.completed').text((d) => {
      return d.percentage + '%';
    });
  }


  _onData = action(payload => {
    const {timestamp, value} = payload;
    const {items, values} = this.props.widget;

    values.replace([
      {
        timestamp,
        value: _.pick(value, items),
      },
    ]);
    const latestValue = values.length > 0 ? values[values.length - 1].value : {};
    if (!_.isEmpty(latestValue)) {
      const v = latestValue[items[0]];
      const fixedValue = _.isInteger(v) ? v : parseInt(v, 10);
      this.itemValue = fixedValue;
      this.update(this.field);
    }
  });

  componentDidMount() {
    const {profileId} = this.props.widget;
    Broker.on(EventType.STATS_DATA(profileId), this._onData.bind(this));
    this.buildWidget();
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

    // TODO: @joey why buildWidget in render? the standard way of using d3 should be:
    // 1. render container for d3 in this render function
    // 2. draw d3 graph in a separate function after componentDidMount
    // 3. incremental redraw whenever data change happens
    // 4. re-draw whole graph whenver size/dimension changes
    // 5. destroy container in componentWillUnmount
    //
    // in this way, d3's render logic is detached from react's render logic. So a re-render of d3
    // container won't trigger re-render whole d3 graph. d3 has its own way of efficent DOM
    // manipulation inside its container created by react
    this.buildWidget();

    return (
      <Widget widget={widget} onResize={this._onResize}>
        <div className="RadialWidget" ref={radial => (this.radial = radial)}>
          <div className="display-name">{displayName}</div>
          <div className="radial-main" />
        </div>
      </Widget>
    );
  }
}
