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
    context
      .select('.donut-main')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr(
        'transform',
        'translate(' + this.width / 2 + ',' + this.height / 2 + ')'
      );

    context
      .selectAll('.donut')
      .data(this.dataset)
      .enter()
      .append('svg:svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('svg:g')
      .attr('class', (d, i) => {
        return 'donut type' + i;
      })
      .attr(
        'transform',
        'translate(' + this.width / 3 + ',' + this.height / 2 + ')'
      );

    this.tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'radial-tooltip d3-tip-top')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('z-index', 1000);

    this.update();
  }

  update() {
    const context = d3.select(this.d3Elem);
    const pie = d3
      .pie()
      .sort(null)
      .value(d => {
        return d.dataPerc;
      });

    const arc = d3
      .arc()
      .innerRadius(this.chartRadius * 0.7)
      .outerRadius(() => {
        return this.chartRadius * 1.08;
      })
      .padAngle(0.03);

    const arcTween = d => {
      const i = d3.interpolate(this._current, d);
      this._current = i(0);
      return function(t) {
        return arc(i(t));
      };
    };

    const paths = context
      .selectAll('.donut')
      .selectAll('path')
      .data(d => {
        return pie(d);
      });

    paths
      .transition()
      .duration(1000)
      .attr('d', arc);
    // .attrTween('d', arcTween);

    const that = this;
    paths
      .enter()
      .append('path')
      .attr('d', arc)
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
  }

  componentDidMount() {
    setTimeout(() => {
      autorun(() => {
        const {values, items} = this.props.widget;
        if (this.d3Elem) {
          const context = d3.select(this.d3Elem);
          const newDataset: Array<Array<Object>> = this.getUpdatedData(
            values,
            items
          );
          if (
            this.dataset.length <= 0 ||
            this.dataset[0].length !== newDataset[0].length
          ) {
            this.dataset = newDataset;
            this.renderD3Component();
          }
          this.dataset = newDataset;
          this.setState({items: this.dataset[0]});
          context.selectAll('.donut').data(this.dataset);
          this.update();
        }
      });
      this.renderD3Component();
    }, 200);
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
      dataSize = Math.random() * 100;
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
        <div className="donut-container">
          <div className="donut-main" ref={r => (this.d3Elem = r)} />
          <StorageList items={this.state.items} />
        </div>
      </Widget>
    );
  }
}
