/**
 * Created by joey on 17/1/18.
 * @Last modified by:   wahaj
 * @Last modified time: 2018-02-02T11:33:40+11:00
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
 *
 * @flow
 */

import * as d3 from 'd3';
import React from 'react';
import {inject, observer} from 'mobx-react';
import {autorun} from 'mobx';
import _ from 'lodash';

import './RadialWidget.scss';
import Widget from './Widget';

const bytesToSize = (bytes: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes <= 0) return '0 B';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  if (i < 0) {
    return '0B';
  }
  return Math.round(bytes / (1024 ** i)) + '' + sizes[i];
};

@inject(({store, api}, {widget}) => {
  return {
    store,
    api,
    widget
  };
})
@observer
export default class RadialWidget extends React.Component<Object, Object> {
  static colors = ['#8A4148', '#8A4148'];
  static gradientColors = ['#BD4133', '#8A4148'];
  static width = 500;
  static height = 500;
  static PI = 2 * Math.PI;
  static gap = 20;

  itemValue: Array<Object> = [];
  field: Object;
  radial: ?HTMLElement;
  text: string = '';

  constructor(props: Object) {
    super(props);
    this.state = {width: 512, height: 512, text: ''};
    this.text = '';
  }

  dataset() {
    // return this.itemValue;
    return this.itemValue.map((v) => {
      return {...v};
    });
  }

  _getInnerRadiusSize() {
    const minValue = Math.min(this.state.width, this.state.height);
    return minValue / 2.9;
  }

  _getOuterRadiusSize() {
    return this._getInnerRadiusSize() + RadialWidget.gap - 5;
  }

  buildWidget() {
    const background = d3.arc()
      .startAngle(0)
      .endAngle(RadialWidget.PI)
      .innerRadius((d) => {
        return this._getInnerRadiusSize() - d.index * RadialWidget.gap;
      })
      .outerRadius((d) => {
        return this._getOuterRadiusSize() - d.index * RadialWidget.gap;
      });

    const elem = d3.select(this.radial);
    elem.select('.radial-main').selectAll('svg').remove();
    // d3.transition();

    const svg = elem.select('.radial-main').append('svg')
      .attr('width', this.state.width)
      .attr('height', this.state.height)
      .append('g')
      .attr('transform', 'translate(' + this.state.width / 2 + ',' + this.state.height / 2 + ')');

    this.buildGradient(svg);
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
      .data(this.dataset.bind(this))
      .enter().append('g');

    field.append('path').attr('class', 'progress').attr('filter', 'url(#dropshadow)');

    // render background
    field.append('path').attr('class', 'bg')
      .style('fill', (d) => RadialWidget.colors[d.index])
      .style('opacity', 0.2)
      .attr('d', background);

    // field.append('text').attr('class', 'icon');

    field.append('text').attr('class', 'completed').attr('transform', 'translate(0, 10)');
    this.field = field;
    d3.transition().duration(1000).each(() => this.update());

    return field;
  }

  arcTween(d: Object) {
    const i = d3.interpolateNumber(d.previousValue, d.percentage);
    return (t: Object) => {
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
      .innerRadius((d) => {
        return this._getInnerRadiusSize() - d.index * RadialWidget.gap;
      })
      .outerRadius((d) => {
        return this._getOuterRadiusSize() - d.index * RadialWidget.gap;
      })
      .cornerRadius((this._getOuterRadiusSize() - this._getInnerRadiusSize()) / 2);
  }

  buildGradient(svg: Object) {
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
      .attr('stop-color', RadialWidget.gradientColors[0])
      .attr('stop-opacity', 1);

    gradient.append('svg:stop')
      .attr('offset', '100%')
      .attr('stop-color', RadialWidget.gradientColors[1])
      .attr('stop-opacity', 1);
    return gradient;
  }

  update() {
    this.field
      .each(function (d) {
        this._value = d.percentage;
      })
      .data(this.dataset.bind(this))
      .each(function (d) {
        d.previousValue = this._value;
      });

    this.field.select('path.progress').transition().duration(1000)
      .attrTween('d', this.arcTween.bind(this))
      .style('fill', () => {
        // if (d.index === 0) {
        return 'url(#gradient)';
        // }
        // return RadialWidget.colors[d.index];
      });
    if (this.itemValue.length === 1) {
      this.field.select('text.completed').text((d) => d.text);
    } else if (this.itemValue.length >= 1) {
      this.field.selectAll('text.completed').remove();
      const texts = this.text.split('\n');
      for (let i = 0; i < texts.length; i += 1) {
        const t = texts[i];
        this.field.append('text').attr('class', 'completed').attr('transform', `translate(0, ${i * 20})`).style('font-size', 'small').text(t);
      }
    }
  }

  componentDidMount() {
    this._onResize(RadialWidget.width, RadialWidget.height);
    const that = this;
    setTimeout(() => {
      that.buildWidget();
      autorun(() => {
        const {items, values} = that.props.widget;
        that.itemValue = that.getValueFromData(items, values);
        that.update();
      });
    }, 200);
  }

  /**
   * TODO: move to schema
   */
  getMaximumValue(value: Object, key: string, historyValues: Array<Object>, itemKey: string): Object {
    const previousValueObj : Object = historyValues.length > 1 ? historyValues[historyValues.length - 2].value : {};
    if (_.isEmpty(previousValueObj)) {
      return {percentage:0, valuePerSec:0};
    }
    const prevValue = previousValueObj[itemKey];
    const v : number = _.isInteger(value[key]) ? value[key] : parseInt(value[key], 10);
    const prevV : number = _.isInteger(prevValue[key]) ? prevValue[key] : parseInt(prevValue[key], 10);
    const max : number = this.getMaximumValueFromHistory(historyValues, itemKey, key);
    let valuePerSec = bytesToSize(Math.abs(v - prevV) / (value.samplingRate / 1000));
    if (valuePerSec === undefined) {
      valuePerSec = 0;
    }
    const percentage = max === 0 ? 100 : Math.abs(v - prevV) / max * 100;
    return {percentage, valuePerSec};
  }

  getValueFromData(items: Array<string>, staleValues: Array<Object>): Array<Object> {
    const values = _.filter(staleValues, v => !_.isEmpty(v) && !_.isEmpty(v.value));
    const latestValue : Object = values.length > 0 ? values[values.length - 1].value : {};
    if (!_.isEmpty(latestValue)) {
      const v = latestValue[items[0]];
      console.log('widget value', items[0], v);
      if (!v) {
        return [];
      }
      if (!_.isInteger(v) && _.keys(v).indexOf('download') >= 0 && _.keys(v).indexOf('upload') >= 0) {
        const previousValue : Object = values.length > 1 ? values[values.length - 2].value : {};
        if (_.isEmpty(previousValue)) {
          return [];
        }
        const download: Object = this.getMaximumValue(v, 'download', values, items[0]);
        const upload: Object = this.getMaximumValue(v, 'upload', values, items[0]);
        let downloadText = '';
        let uploadText = '';
        if (items[0] === 'network') {
          downloadText = 'Download ';
          uploadText = 'Upload ';
        } else if (items[0] === 'disk') {
          downloadText = 'In ';
          uploadText = 'Out ';
        }
        this.text = `${downloadText}${download.valuePerSec}/s \n ${uploadText}${upload.valuePerSec}/s`;
        return [
          {index: 0, percentage: download.percentage},
          {index: 1, percentage: upload.percentage},
        ];
      }
      const fixedValue = _.isInteger(v) ? v : parseInt(v, 10);
      this.text = fixedValue + '%';
      return [{index: 0, percentage: fixedValue, text: fixedValue + '%'}];
    }
    return [];
  }

  getMaximumValueFromHistory(values: Array<Object>, item: string, key: string): number {
    let prev = null;
    let max = 0;
    values.forEach((value) => {
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

  removeD3 = () => {
    if (this.radial) {
      const elem = d3.select(this.radial);
      elem.select('.radial-main').selectAll('svg').remove();
    }
  };

  componentWillUnmount() {
    this.removeD3();
  }

  componentDidUpdate() {
    setTimeout(() => {
      this.removeD3();
      this.buildWidget();
    }, 200);
  }

  _onResize = (width: number, height: number) => {
    this.setState({
      width,
      height
    });
    // this.buildWidget();
  };

  render() {
    const {widget, widgetStyle} = this.props;
    const {displayName} = widget;

    // 1. render container for d3 in this render function
    // 2. draw d3 graph in a separate function after componentDidMount
    // 3. incremental redraw whenever data change happens
    // 4. re-draw whole graph whenver size/dimension changes
    // 5. destroy container in componentWillUnmount
    //
    // in this way, d3's render logic is detached from react's render logic. So a re-render of d3
    // container won't trigger re-render whole d3 graph. d3 has its own way of efficent DOM
    // manipulation inside its container created by react
    return (
      <Widget widget={widget} widgetStyle={widgetStyle} onResize={this._onResize}>
        <div className="RadialWidget" ref={radial => (this.radial = radial)}>
          <div className="display-name">{displayName}</div>
          <div className="radial-main" />
        </div>
      </Widget>
    );
  }
}
