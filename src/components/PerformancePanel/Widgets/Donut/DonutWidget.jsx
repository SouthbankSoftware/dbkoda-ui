/*
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
 * @flow
 * Created by joey on 20/2/18.
 */

import React from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import {inject, observer} from 'mobx-react';
import {autorun} from 'mobx';
import Widget from '../Widget';
import StorageList from './StorageList';
import './DonutWidget.scss';
import {bytesToSize} from '../Utils';

@inject(({store, api}, {widget}) => {
  return {
    store,
    api,
    widget,
  };
})
@observer
export default class DonutWidget extends React.Component<Object, Object> {
  colors: Array<string> = [];
  dataset: Array<Array<Object>> = [];
  radius: number;
  chartRadius: number;
  d3Elem: ?Object;
  width: number;
  height: number;
  tooltip: Object;
  svg: Object;
  paths: Object;

  constructor(props: Object) {
    super(props);
    this.colors = ['#365F87', '#42BB6D', '#7040A3', 'AC8BC0', '#E26847'];
    this.width = 200;
    this.height = 200;
    this.state = {items: []};
  }

  projection() {
    if (this.dataset.length > 0) {
      const prej = {};
      this.dataset[0].forEach(data => {
        prej[data.dbName] = () => data.dataSize;
      });
      return prej;
    }
  }

  removeD3() {
    if (this.d3Elem) {
      d3
        .select(this.d3Elem)
        .select('.donut-main')
        .selectAll('svg')
        .remove();
    }
    if (this.tooltip) {
      this.tooltip.remove();
    }
  }

  _onResize = (width: number, height: number) => {
    this.width = width;
    this.height = height;
    this.renderD3Component();
  };

  renderD3Component() {
    this.radius = Math.min(this.width, this.height) / 2;
    this.chartRadius = this.radius / 2;
    this.removeD3();
    const context = d3.select(this.d3Elem);
    this.svg = context
      .select('.donut-main')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
      .attr(
        'transform',
        'translate(' + this.width / 4 + ',' + this.height / 2 + ')'
      );

    this.tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'radial-tooltip d3-tip-top')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('z-index', 1000);

    return this.update();
  }

  pie = d3
    .pie()
    .sort(null)
    .value(d => {
      return d.dataPerc;
    });

  update() {
    const radius = this.chartRadius;
    const _current = [];
    const arc = d3
      .arc()
      .innerRadius(radius * 0.7)
      .outerRadius(() => {
        return radius * 1.08;
      })
      .padAngle(0.03);
    const arcTween = (d: Object, i: number) => {
      console.log('_current ', _current[i], d);
      const ii = d3.interpolate(_current[i], d);
      _current[i] = ii(0);
      return function(t: Object) {
        return arc(ii(t));
      };
    };
    const that = this;
    this.paths = this.svg
      .datum(this.dataset[0])
      // .selectAll('.donut')
      .selectAll('path')
      .data(this.pie)
      .enter()
      .append('path')
      .attr('d', arc)
      .each((d, i) => {
        _current[i] = d;
        console.log('init _current d,', _current[i], i);
      })
      .style('fill', d => {
        return d.data.color;
      })
      .on('mouseover', d => {
        that.tooltip
          .transition()
          .duration(200)
          .style('opacity', 0.9);
        that.tooltip
          .html(`<p>${d.data.dbName} : ${bytesToSize(d.data.dataSize)}</p>`)
          .style('left', d3.event.pageX - 50 / 2 + 'px')
          .style('top', d3.event.pageY - 28 + 'px');
      })
      .on('mouseout', () => {
        that.tooltip
          .transition()
          .duration(500)
          .style('opacity', 0);
      });
    return arcTween;
  }

  componentDidMount() {
    let arcTween;
    setTimeout(() => {
      autorun(() => {
        const {values, items} = this.props.widget;
        if (this.d3Elem) {
          const newDataset: Array<Array<Object>> = this.getUpdatedData(
            values,
            items
          );
          if (
            this.dataset.length <= 0 ||
            this.dataset[0].length !== newDataset[0].length
          ) {
            this.dataset = newDataset;
            arcTween = this.renderD3Component();
          }
          this.dataset = newDataset;
          this.setState({items: this.dataset[0]});
          this.updateDate(arcTween);
        }
      });
      this.renderD3Component();
      arcTween = this.renderD3Component();
    }, 200);
  }

  updateDate(arcTween: Object) {
    const that = this;
    this.pie.value((d, i) => {
      return that.dataset[0][i].dataPerc;
      // return Math.random() * 100;
    });
    that.paths = that.paths.data(this.pie);
    that.paths
      .transition()
      .duration(1000)
      .attrTween('d', arcTween);
  }

  getUpdatedData(
    values: Array<Object>,
    items: Array<Object>
  ): Array<Array<Object>> {
    const latestValue = values.length > 0 ? values[values.length - 1] : {};
    if (_.isEmpty(latestValue)) {
      return [];
    }
    const value = latestValue.value[items[0]];
    const retValue = _.map(value, dbObject => {
      let dataSize = 0;
      try {
        dataSize = parseInt(dbObject.dataSize, 10);
      } catch (err) {
        // failed to parse integer
      }
      dataSize = Math.random() * 10000;
      return {dbName: dbObject.dbName, dataSize};
    });
    const orderedValue = _.orderBy(retValue, ['dataSize'], ['desc']);
    const sumValue = _.sumBy(retValue, 'dataSize');
    let normalized = orderedValue.map(v => {
      const sum = sumValue > 0 ? sumValue : 1;
      const normalizeSize = _.round(v.dataSize / sum, 2);
      return {...v, dataPerc: normalizeSize};
    });
    _.remove(normalized, o => o.dataPerc <= 0);
    normalized = normalized.slice(0, 5);
    normalized.forEach((norm, i) => {
      norm.color = this.colors[i];
    });
    return [normalized];
  }

  render() {
    const {widget, widgetStyle} = this.props;
    return (
      <Widget
        widget={widget}
        widgetStyle={widgetStyle}
        onResize={this._onResize}
        projection={this.projection()}
      >
        <div className="donut-container" ref={r => (this.d3Elem = r)}>
          <div className="donut-main" />
          <StorageList items={this.state.items} />
        </div>
      </Widget>
    );
  }
}
