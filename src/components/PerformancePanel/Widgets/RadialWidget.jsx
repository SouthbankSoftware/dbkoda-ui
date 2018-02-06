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

@inject(({store, api}, {widget}) => {
  return {
    store,
    api,
    widget
  };
})
@observer
export default class RadialWidget extends React.Component<Object, Object> {
  static colors = ['#8A4148'];
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
    this.state = {width: RadialWidget.width, height: RadialWidget.height, text: ''};
  }

  dataset = () => {
    return this.itemValue;
  };

  _getInnerRadiusSize() {
    const minValue = Math.min(this.state.width, this.state.height);
    return minValue / 2.9;
  }

  _getOuterRadiusSize() {
    return this._getInnerRadiusSize() + RadialWidget.gap - 1;
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
    // elem.select('.radial-main').selectAll('svg').remove();
    // d3.transition();

    const svg = elem.select('.radial-main').append('svg')
      .attr('width', this.state.width)
      .attr('height', this.state.height)
      .append('g')
      .attr('transform', 'translate(' + this.state.width / 2 + ',' + this.state.height / 2 + ')');

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
    if (this.itemValue.length === 1) {
      this.field.select('text.completed').text((d) => d.text);
    } else if (this.itemValue.length >= 1) {
      this.field.selectAll('text.completed').remove();
      const texts = this.state.text.split('\n');
      for (let i = 0; i < texts.length; i += 1) {
        const t = texts[i];
        this.field.append('text').attr('class', 'completed').attr('transform', `translate(0, ${i * 20})`).style('font-size', 'small').text(t);
      }
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this.buildWidget();
      autorun(() => {
        const {items, values} = this.props.widget;
        this.itemValue = this.getValueFromData(items, values);
        const pathsSize = this.field.selectAll('path').size();
        if (pathsSize === 0) {
          this.buildWidget();
        } else {
          this.update();
        }
      });
    }, 500);
  }

  /**
   * TODO: move to schema
   */
  getValueFromData(items: Array<Object>, staleValues: Array<Object>): Array<Object> {
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
        const prevV = previousValue[items[0]];
        const download : number = _.isInteger(v.download) ? v.download : parseInt(v.download, 10);
        const upload : number = _.isInteger(v.upload) ? v.upload : parseInt(v.upload, 10);
        const prevDownload : number = _.isInteger(prevV.download) ? prevV.download : parseInt(prevV.download, 10);
        const prevUplaod : number = _.isInteger(prevV.upload) ? prevV.upload : parseInt(prevV.upload, 10);
        const maxDownload = _.maxBy(values, e => {
          return !_.isEmpty(e) && e.value !== undefined && e.value[items[0]] ? e.value[items[0]].download : 0;
        });
        const maxUpload = _.maxBy(values, e => {
          return !_.isEmpty(e) && e.value !== undefined && e.value[items[0]] ? e.value[items[0]].upload : 0;
        });
        const bytesToSize = (bytes: number) => {
          const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
          if (bytes <= 0) return '0 B';
          const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
          if (i < 0) {
            return '0B';
          }
          return Math.round(bytes / (1024 ** i)) + '' + sizes[i];
        };
        console.log(`download ${download} / ${maxDownload.value[items[0]].download} uplaod ${upload} / ${maxUpload.value[items[0]].upload}`);
        const downloadPerc = maxDownload.value[items[0]].download === 0 ? 100 : download / maxDownload.value[items[0]].download * 100;
        const uploadPerc = maxUpload.value[items[0]].upload === 0 ? 100 : upload / maxUpload.value[items[0]].upload * 100;
        let downloadText = '';
        let uploadText = '';
        if (items[0] === 'network') {
          downloadText = 'Download ';
          uploadText = 'Upload ';
        } else if (items[0] === 'disk') {
          downloadText = 'In ';
          uploadText = 'Out ';
        }
        let downloadValue = bytesToSize(Math.abs(download - prevDownload) / (v.samplingRate / 1000));
        let uploadValue = bytesToSize(Math.abs(upload - prevUplaod) / (v.samplingRate / 1000));
        if (downloadValue === undefined) {
          downloadValue = 0;
        }
        if (uploadValue === undefined) {
          uploadValue = 0;
        }
        const text = `${downloadText}${downloadValue}/s \n ${uploadText}${uploadValue}/s`;
        this.setState({text});
        return [
          {index: 0, percentage: downloadPerc},
          {index: 1, percentage: uploadPerc},
        ];
      }
      const fixedValue = _.isInteger(v) ? v : parseInt(v, 10);
      const text = fixedValue + '%';
      this.setState({text});
      return [{index: 0, percentage: fixedValue, text: fixedValue + '%'}];
    }
    return [];
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
    }, 500);
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
