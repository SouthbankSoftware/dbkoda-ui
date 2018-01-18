/**
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
/**
 * Created by joey on 17/1/18.
 */

import * as d3 from 'd3';
import React from 'react';
import {inject, observer} from 'mobx-react';
import {action} from 'mobx';
import _ from 'lodash';

import './RadialWidget.scss';
import Widget from './Widget';
import {Broker, EventType} from '../../../helpers/broker';

@inject(({store: {widgets}, api}, {id}) => {
  const widget = widgets.get(id);

  return {
    store: {
      widget,
    },
    api,
  };
})
@observer
export default class RadialWidget extends Widget {
  static colors = ['#e90b3a', '#a0ff03', '#1ad5de'];
  static width = 500;
  static height = 500;
  static PI = 2 * Math.PI;
  static gap = 2;

  static arc = d3.arc()
    .startAngle(0)
    .endAngle((d) => {
      return d.percentage / 100 * RadialWidget.PI;
    })
    .innerRadius((d) => {
      return 140 - d.index * (40 + RadialWidget.gap);
    })
    .outerRadius((d) => {
      return 180 - d.index * (40 + RadialWidget.gap);
    })
    .cornerRadius(20);// modified d3 api only


  constructor(props) {
    super(props);
    this.state = {field: null};
    this.itemValue = 0;
    this.dataset = () => {
      return [
        {index: 0, name: 'move', icon: '\uF105', percentage: this.itemValue}
      ];
    };
  }

  getDisplayName(items) {
    if (items && items.length > 0) {
      if (items[0] === 'cpu') {
        return 'CPU';
      }
      if (items[0] === 'memory') {
        return 'Memory';
      }
    }
  }

  buildWidget(items) {
    const background = d3.arc()
      .startAngle(0)
      .endAngle(RadialWidget.PI)
      .innerRadius((d) => {
        return 140 - d.index * (40 + RadialWidget.gap);
      })
      .outerRadius((d) => {
        return 180 - d.index * (40 + RadialWidget.gap);
      });
    const elem = d3.select(this.radial);
    const svg = elem.select('.radial-main').append('svg')
      .attr('width', RadialWidget.width)
      .attr('height', RadialWidget.height)
      .append('g')
      .attr('transform', 'translate(' + RadialWidget.width / 2 + ',' + RadialWidget.height / 2 + ')');

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
      .attr('stop-color', '#fe08b5')
      .attr('stop-opacity', 1);

    gradient.append('svg:stop')
      .attr('offset', '100%')
      .attr('stop-color', '#ff1410')
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

    field.append('path').attr('class', 'bg')
      .style('fill', (d) => {
        return RadialWidget.colors[d.index];
      })
      .style('opacity', 0.2)
      .attr('d', background);

    // field.append('text').attr('class', 'icon');

    field.append('text').attr('class', 'goal').text(this.getDisplayName(items)).attr('transform', 'translate(0,50)');
    field.append('text').attr('class', 'completed').attr('transform', 'translate(0,0)');

    d3.transition().duration(1750).each(() => this.update(field));

    return field;
  }

  arcTween(d) {
    const i = d3.interpolateNumber(d.previousValue, d.percentage);
    return (t) => {
      d.percentage = i(t);
      return RadialWidget.arc(d);
    };
  }

  update(field) {
    field = field
      .each(function (d) {
        this._value = d.percentage;
      })
      .data(this.dataset)
      .each(function (d) {
        d.previousValue = this._value;
      });

    field.select('path.progress').transition().duration(1750).delay((d, i) => {
      return i * 200;
    })
    // .ease('elastic')
      .attrTween('d', this.arcTween.bind(this))
      .style('fill', (d) => {
        if (d.index === 0) {
          return 'url(#gradient)';
        }
        return RadialWidget.colors[d.index];
      });

    field.select('text.icon').text((d) => {
      return d.icon;
    }).attr('transform', (d) => {
      return 'translate(10,' + -(150 - d.index * (40 + RadialWidget.gap)) + ')';
    });
    field.select('text.completed').text((d) => {
      return d.percentage;
    });
  }


  _onData = action(payload => {
    const {timestamp, value} = payload;
    const {items, values} = this.props.store.widget;

    values.replace([
      {
        timestamp,
        value: _.pick(value, items),
      },
    ]);
    const latestValue = values.length > 0 ? values[values.length - 1].value : {};

    const v = latestValue[items[0]];
    const fixedValue = _.isInteger(v) ? v : parseInt(v).toFixed(2);
    this.itemValue = fixedValue;
    this.update(this.state.field);
  });

  componentDidMount() {
    const {profileId, items} = this.props.store.widget;
    Broker.on(EventType.STATS_DATA(profileId), this._onData.bind(this));
    const field = this.buildWidget(items);
    this.setState({field});
  }

  render() {
    return (
      <div className="radial-widget" ref={radial => (this.radial = radial)}>
        <div className="radial-main" />
      </div>
    );
  }
}
