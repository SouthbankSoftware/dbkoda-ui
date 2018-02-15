/**
 * Created by joey on 17/1/18.
 * @Last modified by:   wahaj
 * @Last modified time: 2018-02-14T16:51:20+11:00
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
  static runQueueColors = ['#362728', '#00ff00', '#FF0000', '#CC0000', '#990000'];
  static width = 500;
  static height = 500;
  static PI = 2 * Math.PI;
  static gap = 20;

  itemValue: Array<Object> = [];
  field: Object;
  radial: ?HTMLElement;
  text: string = '';
  tooltip: Object;

  constructor(props: Object) {
    super(props);
    this.state = {width: 512, height: 512, text: ''};
    this.text = '';
  }

  dataset() {
    return this.itemValue.map(v => {
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
    const background = d3
      .arc()
      .startAngle(0)
      .endAngle(RadialWidget.PI)
      .innerRadius(d => {
        return this._getInnerRadiusSize() - d.index * RadialWidget.gap;
      })
      .outerRadius(d => {
        return this._getOuterRadiusSize() - d.index * RadialWidget.gap;
      });

    const elem = d3.select(this.radial);
    elem
      .select('.radial-main')
      .selectAll('svg')
      .remove();
    // d3.transition();

    const svg = elem
      .select('.radial-main')
      .append('svg')
      .attr('width', this.state.width)
      .attr('height', this.state.height)
      .append('g')
      .attr('class', 'radial-chart')
      .attr(
        'transform',
        'translate(' + this.state.width / 2 + ',' + this.state.height / 2 + ')'
      );

    this.buildGradient(svg);
    // add some shadows
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
      .selectAll('.radial')
      .data(this.dataset.bind(this))
      .enter()
      .append('g')
      .attr('class', 'radial-fld');

    field
      .append('path')
      .attr('class', 'progress')
      .attr('filter', 'url(#dropshadow)');

    // render background
    field
      .append('path')
      .attr('class', 'bg')
      .style('fill', d => RadialWidget.colors[d.index])
      .style('opacity', 0.2)
      .attr('d', background);

    // field.append('text').attr('class', 'icon');

    field
      .append('text')
      .attr('class', 'completed')
      .attr('transform', 'translate(0, 5)');
    this.field = field;
    d3
      .transition()
      .duration(1000)
      .each(() => this.update());
    this.tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'radial-tooltip d3-tip-top')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('z-index', 1000);
    return field;
  }

  addRunQueueDisplay(noOfNodes: number) {
    const maxNodes = 20;
    const arrData = [];

    for (let i = 0; i < maxNodes; i += 1) {
      if (i < noOfNodes) {
        if (noOfNodes >= maxNodes) {
          if (i < noOfNodes % maxNodes) {
            const busyHigh = Math.ceil(noOfNodes / maxNodes);
            arrData.push({busy: '' + busyHigh});
          } else {
            const busyLow = Math.floor(noOfNodes / maxNodes);
            arrData.push({busy: '' + busyLow});
          }
        } else {
          arrData.push({busy: '1'});
        }
      } else {
        arrData.push({busy: '0'});
      }
    }

    const radius = (Math.min(this.state.width, this.state.height) - 30) / 2;

    const arc = d3
      .arc()
      .outerRadius(radius - 10)
      .innerRadius(radius - 20)
      .cornerRadius(10)
      .padAngle(0.03);

    const pie = d3
      .pie()
      .sort(null)
      .value(_ => {
        return 360 / maxNodes;
      }); // 90deg / 5 = 18

    d3.select(this.radial)
      .select('.radial-main')
      .select('svg')
      .select('.chart-rc')
      .remove();

    const svg = d3.select(this.radial)
      .select('.radial-main')
      .select('svg')
      .append('g')
      .attr('class', 'chart-rc')
      .attr('transform', 'translate(' + this.state.width / 2 + ',' + this.state.height / 2 + ')');

    const g = svg
      .selectAll('.arc-rc')
      .data(pie(arrData))
      .enter()
      .append('g')
      .attr('class', 'arc-rc');

    g
      .append('path')
      .attr('d', arc)
      .style('fill', d => {
        return RadialWidget.runQueueColors[parseInt(d.data.busy, 10)];
      }).on('mouseover', () => {
        const tipData = `RunQueue ${noOfNodes}`;
        const tipWidth = String(tipData).length * 8;
        this.tooltip
          .transition()
          .duration(200)
          .style('opacity', 0.9);
        this.tooltip
          .html(`<p>RunQueue ${noOfNodes}</p>`)
          .style('left', d3.event.pageX - (tipWidth / 2) + 'px')
          .style('top', d3.event.pageY - 28 + 'px');
      }
    )
      .on('mouseout', () => {
        this.tooltip
          .transition()
          .duration(500)
          .style('opacity', 0);
      });
  }

  arcTween(d: Object) {
    const i = d3.interpolateNumber(d.previousValue, d.percentage);
    return (t: Object) => {
      d.percentage = i(t);
      return this.arc()(d);
    };
  }

  arc() {
    return d3
      .arc()
      .startAngle(0)
      .endAngle(d => {
        return d.percentage / 100 * RadialWidget.PI;
      })
      .innerRadius(d => {
        return this._getInnerRadiusSize() - d.index * RadialWidget.gap;
      })
      .outerRadius(d => {
        return this._getOuterRadiusSize() - d.index * RadialWidget.gap;
      })
      .cornerRadius(
        (this._getOuterRadiusSize() - this._getInnerRadiusSize()) / 2
      );
  }

  buildGradient(svg: Object) {
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
      .attr('stop-color', RadialWidget.gradientColors[0])
      .attr('stop-opacity', 1);

    gradient
      .append('svg:stop')
      .attr('offset', '100%')
      .attr('stop-color', RadialWidget.gradientColors[1])
      .attr('stop-opacity', 1);
    return gradient;
  }

  update() {
    const that = this;
    this.field
      .each(function (d) {
        this._value = d.percentage;
      })
      .data(this.dataset.bind(this))
      .each(function (d) {
        d.previousValue = this._value;
      })
      .selectAll('.bg')
      .on('mouseover', d => {
        const data = that.dataset()[d.index];
        if (data.tooltip) {
          const tipWidth = String(data.tooltip).length * 8;
          that.tooltip
            .transition()
            .duration(200)
            .style('opacity', 0.9);
          that.tooltip
            .html(`<p>${data.tooltip}</p>`)
            .style('left', d3.event.pageX - (tipWidth / 2) + 'px')
            .style('top', d3.event.pageY - 28 + 'px');
        }
      })
      .on('mouseout', () => {
        that.tooltip
          .transition()
          .duration(500)
          .style('opacity', 0);
      });

    this.field
      .select('path.progress')
      .transition()
      .duration(1000)
      .attrTween('d', this.arcTween.bind(this))
      .style('fill', d => {
        if (d.index === 0) {
          return 'url(#gradient)';
        }
        return RadialWidget.colors[d.index];
      });
    if (this.itemValue.length === 1) {
      if (_.keys(this.itemValue[0]).indexOf('runQueue') >= 0) {
        this.field.selectAll('text.completed').remove();
        const texts = this.text.split('\n');
        for (let i = 0; i < texts.length; i += 1) {
          const t = texts[i];
          let txtColor = 'white';
          if (i == 1) {
            const idxColor = Math.ceil(parseInt(t, 10) / 20);
            txtColor = RadialWidget.runQueueColors[idxColor];
          }
          this.field
            .append('text')
            .attr('class', 'completed')
            .attr('transform', `translate(0, ${i * 15})`)
            .style('font-size', 'small')
            .style('fill', txtColor)
            .text(t);
        }
      } else {
        this.field.select('text.completed').text(d => d.text);
      }
    } else if (this.itemValue.length >= 1) {
      this.field.selectAll('text.completed').remove();
      const texts = this.text.split('\n');
      for (let i = 0; i < texts.length; i += 1) {
        const t = texts[i];
        this.field
          .append('text')
          .attr('class', 'completed')
          .attr('transform', `translate(0, ${i * 20})`)
          .style('font-size', 'small')
          .text(t);
      }
    }
  }

  componentDidMount() {
    this._onResize(RadialWidget.width, RadialWidget.height);
    const {widget} = this.props;
    const {widgetItemKeys} = widget;
    this.itemValue = [];
    if (widgetItemKeys) {
      widgetItemKeys.forEach((w, i) => this.itemValue.push({index: i, percentage: 0, tooltip: '0%', text: '0%'}));
    } else {
      this.itemValue.push({index: 0, percentage: 0, tooltip: '0%', text: '0%'});
    }
    setTimeout(() => {
      this.text = '0%';
      this.buildWidget();
      autorun(() => {
        const {items, values} = this.props.widget;
        const newItemValue = this.getValueFromData(items, values);
        if (newItemValue.length > 0) {
          this.itemValue = newItemValue;
          this.update();
          if (_.keys(this.itemValue[0]).indexOf('runQueue') >= 0) {
            this.addRunQueueDisplay(this.itemValue[0].runQueue);
          }
        }
      });
    }, 200);
  }

  /**
   * TODO: move to schema
   */
  getValueFromData(items: Array<string>, staleValues: Array<Object>): Array<Object> {
    const {widget} = this.props;
    const {widgetItemKeys, widgetDisplayNames, showRunQueue, useHighWaterMark} = widget;
    const values = _.filter(staleValues, v => !_.isEmpty(v) && !_.isEmpty(v.value));
    const latestValue: Object = values.length > 0 ? values[values.length - 1].value : {};
    const key = items[0];
    console.log('get stat value ', latestValue);
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    const highWaterMark = (previousValue, itemKey, itemKeyValues, i) => {
      if (previousValue[key][`max${itemKey}`] === undefined) {
        previousValue[key][`max${itemKey}`] = 0;
      }
      latestValue[key][`${itemKey}Delta`] = Math.abs(latestValue[key][itemKey] - previousValue[key][itemKey]);
      if (latestValue[key][`${itemKey}Delta`] > previousValue[key][`max${itemKey}`]) {
        latestValue[key][`max${itemKey}`] = latestValue[key][`${itemKey}Delta`];
      } else {
        latestValue[key][`max${itemKey}`] = previousValue[key][`max${itemKey}`];
      }
      itemKeyValues[itemKey] = {
        percentage: latestValue[key][`max${itemKey}`] === 0 ? 0 : parseInt(latestValue[key][`${itemKey}Delta`] / latestValue[key][`max${itemKey}`] * 100, 10),
        valuePerSec: bytesToSize(latestValue[key][`${itemKey}Delta`] / (latestValue[key].samplingRate / 1000))
      };
      this.text += `${widgetDisplayNames[i]} ${itemKeyValues[itemKey].valuePerSec}/s`;
      if (i < widgetItemKeys.length - 1) {
        this.text += '\n';
      }
    };
    if (!_.isEmpty(latestValue)) {
      const v = latestValue[key];
      if (!v) {
        return [];
      }
      let multipleKeys = false;
      if (widgetItemKeys && widgetItemKeys.length > 1) {
        const diff = _.difference(widgetItemKeys, _.keys(v));
        multipleKeys = diff.length === 0;
      }
      const previousValue: Object = values.length > 1 ? values[values.length - 2].value : {};
      if (!_.isInteger(v) && multipleKeys) {
        const itemKeyValues = {};
        this.text = '';
        if (useHighWaterMark) {
          if (_.isEmpty(previousValue)) {
            return [];
          }
          widgetItemKeys.forEach((itemKey, i) => {
            highWaterMark(previousValue, itemKey, itemKeyValues, i);
          });
        } else {
          widgetItemKeys.forEach((itemKey, i) => {
            itemKeyValues.push({index: i, percentage: v[itemKey] + '%'});
          });
        }
        const retValue = widgetItemKeys.map((itemKey, i) => {
          return {
            index: i,
            percentage: itemKeyValues[itemKey].percentage,
            tooltip: `${widgetDisplayNames[i]} ${itemKeyValues[itemKey].percentage}%`
          };
        });
        console.log('ret value', retValue);
        return retValue;
      } else if (showRunQueue && key === 'cpu') {
        const fixedValue = _.isInteger(v.usage)
          ? v.usage
          : parseInt(v.usage, 10);
        const runQueueValue = _.isInteger(v.runQueue)
          ? v.runQueue
          : parseInt(v.runQueue, 10);
        this.text = fixedValue + '%\n' + runQueueValue;
        return [
          {
            index: 0,
            percentage: fixedValue,
            runQueue: runQueueValue,
            text: fixedValue + '%',
            tooltip: `${capitalize(key)} ${fixedValue} %`
          }
        ];
      }
      let fixedValue = _.isInteger(v) ? 0 : parseInt(v, 10);
      if (isNaN(fixedValue)) {
        fixedValue = 0;
      }
      this.text = fixedValue + '%';
      return [
        {
          index: 0,
          percentage: fixedValue,
          text: fixedValue + '%',
          tooltip: `${capitalize(key)} ${fixedValue} %`
        }
      ];
    }
    return [];
  }

  removeD3 = () => {
    if (this.radial) {
      const elem = d3.select(this.radial);
      elem
        .select('.radial-main')
        .selectAll('svg')
        .remove();
    }
    if (this.tooltip) {
      this.tooltip.remove();
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
  };

  /**
   * TODO: move it to schema
   */
  projection = () => {
    const {items, widgetItemKeys, widgetDisplayNames, showRunQueue} = this.props.widget;
    const key = items[0];
    if (widgetDisplayNames && widgetDisplayNames.length > 0) {
      const ret = {};
      widgetDisplayNames.forEach((k, i) => {
        ret[k] = (v) => {
          return v.value[key][`${widgetItemKeys[i]}Delta`];
        };
      });
      return ret;
    }
    if (showRunQueue) {
      return {
        'usage': v => {
          console.log('usage:', v, key);
          return v.value[key].usage;
        },
        'runQueue': v => {
          return v.value[key].runQueue;
        },
      };
    }
    return {
      [key]: v => v.value[key]
    };
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
      <Widget
        widget={widget}
        widgetStyle={widgetStyle}
        onResize={this._onResize}
        projection={this.projection()}
      >
        <div className="RadialWidget" ref={radial => (this.radial = radial)}>
          <div className="display-name">{displayName}</div>
          <div className="radial-main"/>
        </div>
      </Widget>
    );
  }
}
