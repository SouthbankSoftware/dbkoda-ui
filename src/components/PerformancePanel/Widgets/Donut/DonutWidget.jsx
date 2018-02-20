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
import {inject, observer} from 'mobx-react';
import {autorun} from 'mobx';
import Widget from '../Widget';

@inject(({ store, api }, { widget }) => {
  return {
    store,
    api,
    widget
  };
})
@observer
export default class DonutWidget extends React.Component<Object, Object> {
  colors: Array<string> = [];
  dataset: Array<Object>;
  radius: number;
  chartRadius: number;
  d3Elem: ?Object;
  context: Object;

  constructor(props: Object) {
    super(props);
    this.colors = [
      '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
      '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
    ];
    this.state = {width: 500, height: 500};
    this.dataset = this.genData();
  }

  projection() {

  }

  removeD3() {
    this.context
      .select('.donut-main')
      .selectAll('svg')
      .remove();
  }

  _onResize = (width: number, height: number) => {
    this.setState({
      width,
      height
    });
    this.renderD3Component();
  }

  renderD3Component() {
    console.log('size: ', this.state);
    this.radius = Math.min(this.state.width, this.state.height) / 2;
    this.chartRadius = this.radius / 2;
    this.context = d3.select(this.d3Elem);
    this.removeD3();

    this.context
      .select('.donut-main')
      .append('svg')
      .attr('width', this.state.width)
      .attr('height', this.state.height)
      .attr(
        'transform',
        'translate(' + this.state.width / 2 + ',' + this.state.height / 2 + ')'
      );

    this.context.selectAll('.donut')
      .data(this.dataset)
      .enter().append('svg:svg')
      .attr('width', this.state.width)
      .attr('height', this.state.height)
      .append('svg:g')
      .attr('class', (d, i) => {
        return 'donut type' + i;
      })
      .attr('transform', 'translate(' + (this.state.width / 2) + ',' + (this.state.height / 2) + ')');
    this.update();
  }

  update() {
    const pie = d3.pie()
      .sort(null)
      .value((d) => {
        return d.dataSize;
      });

    const arc = d3.arc()
      .innerRadius(this.chartRadius * 0.7)
      .outerRadius(() => {
        return this.chartRadius * 1.08;
      }).padAngle(0.03);
    const paths = this.context.selectAll('.donut')
      .selectAll('path')
      .data((d) => {
        console.log('d.data=', d.data);
        return pie(d.data);
      });

    paths
      .transition()
      .duration(1000)
      .attr('d', arc);

    paths.enter()
      .append('svg:path')
      .attr('d', arc)
      .style('fill', (d, i) => {
        return this.colors[i];
      })
      .style('stroke', '#FFFFFF');
    // .on(eventObj)
  }

  genData() {
    const type = ['Users'];
    const unit = ['M', 'GB', ''];
    const cat = ['Google Drive', 'Dropbox', 'iCloud', 'OneDrive', 'Box'];

    const dataset = [];

    for (let i = 0; i < type.length; i += 1) {
      const data = [];
      let total = 0;

      for (let j = 0; j < cat.length; j += 1) {
        const value = Math.random() * 10 * (3 - i);
        total += value;
        data.push({
          'dbName': cat[j],
          'dataSize': value
        });
      }

      dataset.push({
        'data': data,
      });
    }
    return dataset;
  }

  componentDidMount() {
    setTimeout(() => {
      autorun(() => {
        const {values, items} = this.props.widget;
        console.log('get values', items, values.length);
        if (this.context) {
          this.getUpdatedData(values, items);
          this.context.selectAll('.donut').data(this.genData());
          this.update();
        }
      });
      this.renderD3Component();
    }, 200);
  }

  getUpdatedData(values, items) {
    const latestValue = values.length > 0 ? values[values.length - 1] : {};
    if (_.isEmpty(latestValue)) {
      return [];
    }
    const value = latestValue.value[items[0]];
    const retValue = [];
    _.forOwn(value, (dbValue, dbName) => {
      retValue.push({dbName, dataSize: dbValue.dataSize});
    });
    return [{data: retValue}];
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
        <div className="donut-main" ref={r => (this.d3Elem = r)} />
      </Widget>);
  }
}
