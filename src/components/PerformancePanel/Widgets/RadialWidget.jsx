/**
 * Created by joey on 17/1/18.
 * @Last modified by:   wahaj
 * @Last modified time: 2018-02-21T11:52:00+11:00
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
import { inject, observer } from 'mobx-react';
import { autorun } from 'mobx';
import _ from 'lodash';

import './RadialWidget.scss';
import Widget from './Widget';
import {bytesToSize} from './Utils';

const colors = ['#01969E', '#01969E'];
const gradientColors = ['#01969E', '#01969E'];
const runQueueColors = ['#362728', '#00b458', '#c40d0d', '#960909', '#750808'];

@inject(({ store, api }, { widget }) => {
  return {
    store,
    api,
    widget
  };
})
@observer
export default class RadialWidget extends React.Component<Object, Object> {
  static width = 500;
  static height = 500;
  static PI = 2 * Math.PI;
  static gap = 20;

  itemValue: Array<Object> = [];
  field: Object;
  radial: ?HTMLElement;
  text: string = '';
  tooltip: Object;
  colors: any;
  gradientColors: any;

  constructor(props: Object) {
    super(props);
    this.state = { width: 512, height: 512, text: '' };
    this.text = '';
  }

  dataset() {
    return this.itemValue.map(v => {
      return { ...v };
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
    let xTranslate = this.state.width / 2;
    if (this.props.widget.title === 'Network') {
      xTranslate = this.state.width / 2 - 20;
    }
    const svg = elem
      .select('.radial-main')
      .append('svg')
      .attr('width', this.state.width)
      .attr('height', this.state.height)
      .append('g')
      .attr('class', 'radial-chart')
      .attr(
        'transform',
        'translate(' + xTranslate + ',' + this.state.height / 2 + ')'
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
      .style('fill', d => this.colors[d.index])
      .style('opacity', 0.2)
      .attr('d', background);

    field
      .append('text')
      .attr('class', 'completed')
      .style('fill', d => this.colors[d.index])
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

    if (_.keys(this.itemValue[0]).indexOf('runQueue') >= 0) {
      this.addRunQueueDisplay(this.itemValue[0].runQueue);
    }
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
            arrData.push({ busy: '' + busyHigh });
          } else {
            const busyLow = Math.floor(noOfNodes / maxNodes);
            arrData.push({ busy: '' + busyLow });
          }
        } else {
          arrData.push({ busy: '1' });
        }
      } else {
        arrData.push({ busy: '0' });
      }
    }

    const radius = (Math.min(this.state.width, this.state.height) - 30) / 2;
    const innerRadius = radius - radius * 0.4;
    const outerRadius = radius - radius * 0.22;
    const arc = d3
      .arc()
      .outerRadius(outerRadius)
      .innerRadius(innerRadius)
      .cornerRadius(10)
      .padAngle(0.035);

    const pie = d3
      .pie()
      .sort(null)
      .value(_ => {
        return 360 / maxNodes;
      }); // 90deg / 5 = 18

    d3
      .select(this.radial)
      .select('.radial-main')
      .select('svg')
      .select('.chart-rc')
      .remove();

    const svg = d3
      .select(this.radial)
      .select('.radial-main')
      .select('svg')
      .append('g')
      .attr('class', 'chart-rc')
      .attr(
        'transform',
        'translate(' + this.state.width / 2 + ',' + this.state.height / 2 + ')'
      );

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
        return runQueueColors[parseInt(d.data.busy, 10)];
      })
      .on('mouseover', () => {
        const tipData = `RunQueue ${noOfNodes}`;
        const tipWidth = String(tipData).length * 8;
        this.tooltip
          .transition()
          .duration(200)
          .style('opacity', 0.9);
        this.tooltip
          .html(`<p>RunQueue ${noOfNodes}</p>`)
          .style('left', d3.event.pageX - tipWidth / 2 + 'px')
          .style('top', d3.event.pageY - 28 + 'px');
      })
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
      .attr('stop-color', this.gradientColors[0])
      .attr('stop-opacity', 1);

    gradient
      .append('svg:stop')
      .attr('offset', '100%')
      .attr('stop-color', this.gradientColors[0])
      .attr('stop-opacity', 1);
    return gradient;
  }

  update() {
    const that = this;
    this.field
      .each(function(d) {
        this._value = d.percentage;
      })
      .data(this.dataset.bind(this))
      .each(function(d) {
        d.previousValue = this._value;
      })
      .selectAll('.bg')
      .on('mouseover', d => {
        const data = that.dataset()[d.index];
        if (data && data.tooltip) {
          const tipWidth = String(data.tooltip).length * 8;
          that.tooltip
            .transition()
            .duration(200)
            .style('opacity', 0.9);
          that.tooltip
            .html(`<p>${data.tooltip}</p>`)
            .style('left', d3.event.pageX - tipWidth / 2 + 'px')
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
        return this.colors[d.index];
      });
    if (_.keys(this.itemValue[0]).indexOf('runQueue') >= 0) {
      this.addRunQueueDisplay(this.itemValue[0].runQueue);
    }

    if (this.itemValue.length === 1) {
      if (_.keys(this.itemValue[0]).indexOf('runQueue') >= 0) {
        this.field.selectAll('text.completed').remove();
        const texts = this.text.split('\n');
        for (let i = 0; i < texts.length; i += 1) {
          const t = texts[i];
          let txtColor = this.colors[0];
          if (i === 1) {
            const idxColor = Math.ceil(parseInt(t, 10) / 20);
            txtColor = runQueueColors[idxColor];
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
        this.field.selectAll('text.completed').remove();
        this.field
          .append('text')
          .attr('class', 'completed')
          .attr('transform', 'translate(0, 5)')
          .style('fill', () => this.colors[0])
          .text(d => d.text);
      }
    } else if (this.itemValue.length >= 1) {
      let xTranslate = 0;
      if (this.props.widget.title === 'Network') {
        xTranslate = 85;
      }
      this.field.selectAll('text.completed').remove();
      const texts = this.text.split('\n');
      for (let i = 0; i < texts.length; i += 1) {
        const t = texts[i];
        this.field
          .append('text')
          .attr('class', 'completed layer-' + i)
          .attr('transform', `translate(${xTranslate}, ${i * 20})`)
          .style('font-size', 'small')
          .text(t);
      }
    }
  }

  componentDidMount() {
    if (this.props.widget.colorList) {
      this.colors = this.props.widget.colorList;
      this.gradientColors = this.props.widget.colorList;
    } else {
      this.colors = colors;
      this.gradientColors = gradientColors;
    }
    this._onResize(RadialWidget.width, RadialWidget.height);
    const { widget } = this.props;
    const { widgetItemKeys } = widget;
    this.itemValue = [];
    if (widgetItemKeys) {
      widgetItemKeys.forEach((w, i) =>
        this.itemValue.push({
          index: i,
          percentage: 0,
          tooltip: '0%',
          text: '0%'
        })
      );
    } else {
      this.itemValue.push({
        index: 0,
        percentage: 0,
        tooltip: '0%',
        text: '0%'
      });
    }
    setTimeout(() => {
      this.text = '0%';
      this.buildWidget();
      autorun(() => {
        const { items, values } = this.props.widget;
        const newItemValue = this.getValueFromData(items, values);
        if (newItemValue.length > 0) {
          if (newItemValue.length !== this.itemValue.length) {
            this.removeD3();
            this.itemValue = newItemValue;
            this.buildWidget();
          }
          this.itemValue = newItemValue;
          this.update();
        }
      });
    }, 200);
  }

  /**
   * TODO: move to schema
   */
  getValueFromData(
    items: Array<string>,
    staleValues: Array<Object>
  ): Array<Object> {
    const { widget } = this.props;
    const {
      widgetItemKeys,
      widgetDisplayNames,
      showRunQueue,
      useHighWaterMark
    } = widget;
    const values = _.filter(
      staleValues,
      v => !_.isEmpty(v) && !_.isEmpty(v.value)
    );
    const latestValue: Object =
      values.length > 0 ? values[values.length - 1].value : {};
    const key = items[0];
    // console.log('get stat value ', latestValue);
    const capitalize = str =>
      str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    const highWaterMark = (
      previousValue,
      itemKey,
      itemKeyValues,
      i,
      latest
    ) => {
      if (previousValue[key][`max${itemKey}`] === undefined) {
        previousValue[key][`max${itemKey}`] = 0;
      }
      latest[key][`${itemKey}Delta`] = Math.abs(
        latest[key][itemKey] - previousValue[key][itemKey]
      );
      if (
        latest[key][`${itemKey}Delta`] > previousValue[key][`max${itemKey}`]
      ) {
        latest[key][`max${itemKey}`] = latest[key][`${itemKey}Delta`];
      } else {
        latest[key][`max${itemKey}`] = previousValue[key][`max${itemKey}`];
      }
      itemKeyValues[itemKey] = {
        percentage:
          latest[key][`max${itemKey}`] === 0
            ? 0
            : parseInt(
                latest[key][`${itemKey}Delta`] /
                  latest[key][`max${itemKey}`] *
                  100,
                10
              ),
        valuePerSec: bytesToSize(
          latest[key][`${itemKey}Delta`] / (latest[key].samplingRate / 1000)
        )
      };
      this.text += `${widgetDisplayNames[i]} ${
        itemKeyValues[itemKey].valuePerSec
      }/s`;
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
      const previousValue: Object =
        values.length > 1 ? values[values.length - 2].value : {};
      if (!_.isInteger(v) && multipleKeys) {
        const itemKeyValues = {};
        this.text = '';
        if (useHighWaterMark) {
          if (_.isEmpty(previousValue)) {
            return [];
          }
          widgetItemKeys.forEach((itemKey, i) => {
            highWaterMark(
              previousValue,
              itemKey,
              itemKeyValues,
              i,
              latestValue
            );
          });
        } else {
          widgetItemKeys.forEach((itemKey, i) => {
            itemKeyValues.push({ index: i, percentage: v[itemKey] + '%' });
          });
        }
        const retValue = widgetItemKeys.map((itemKey, i) => {
          return {
            index: i,
            percentage: itemKeyValues[itemKey].percentage,
            tooltip: `${widgetDisplayNames[i]} ${
              itemKeyValues[itemKey].percentage
            }%`
          };
        });
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
      } else if (useHighWaterMark) {
        if (_.isEmpty(previousValue)) {
          return [];
        }
        const itemKeyValues = {};
        highWaterMark(previousValue, 'download', itemKeyValues, 0, latestValue);
        return [
          {
            index: 0,
            percentage: itemKeyValues.download.percentage,
            tooltip: `${capitalize(key)} ${itemKeyValues.download.percentage}%`,
            text: `In ${itemKeyValues.download.valuePerSec}/s`
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
    const {
      items,
      widgetItemKeys,
      widgetDisplayNames,
      showRunQueue
    } = this.props.widget;
    const key = items[0];
    if (widgetDisplayNames && widgetDisplayNames.length > 0) {
      const ret = {};
      widgetDisplayNames.forEach((k, i) => {
        ret[k] = v => {
          return v.value[key] ? v.value[key][`${widgetItemKeys[i]}Delta`] : 0;
        };
      });
      return ret;
    }
    if (showRunQueue) {
      return {
        usage: (v: Object) => {
          return v.value[key] ? v.value[key].usage : 0;
        },
        runQueue: (v: Object) => {
          return v.value[key] ? v.value[key].runQueue : 0;
        }
      };
    }
    return {
      [key]: v => v.value[key]
    };
  };

  render() {
    const { widget, widgetStyle } = this.props;
    const { displayName } = widget;
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
          <div className="radial-main" />
        </div>
      </Widget>
    );
  }
}
