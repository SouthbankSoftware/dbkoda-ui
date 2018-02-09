/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-02-07T10:55:24+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-02-09T11:58:46+11:00
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

import * as React from 'react';
import _ from 'lodash';
import { autorun } from 'mobx';
import type { WidgetState } from '~/api/Widget';
import * as d3 from 'd3';
import 'd3-selection-multi';
import Widget from './Widget';
import './ProgressBarWidget.scss';

const colors = ['#e0a767', '#a5a11b', '#58595b'];
const BAR_CLIPPATH_ID = 'barCP';
const vbWidth = 500;
const vbHeight = 100;
const barHeight = 30;
const chartWidth = vbWidth - 60;

type Props = {
  widget: WidgetState,
  widgetStyle: *,
  rotate?: number
};

export default class ProgressBarWidget extends React.Component<Props> {
  _chartEl: *;
  _chart: *;
  _dataGroup: *;
  _valueRec: *;
  _autorunDisposer: *;
  _tipEl: *;
  _tip: *;

  _createD3View = () => {
    this._chart = d3.select(this._chartEl).attrs({
      width: '100%',
      height: '100%',
      viewBox: `0 0 ${vbWidth} ${vbHeight}`,
      perserveAspectRatio: 'xMinYMid'
    });

    if (!this._chart) return;

    this._tip = d3.select(this._tipEl).style('opacity', 0);

    const defs = this._chart.append('defs');

    // defined a clippath to clip unwanted area from rendering
    defs
      .append('clipPath')
      .attr('id', BAR_CLIPPATH_ID)
      .append('rect')
      .attrs({
        rx: 15,
        ry: 15,
        height: barHeight - 2,
        width: chartWidth,
        x: 0,
        y: 1
      });

    // chart background
    this._chart
      .append('g')
      .attr('transform', 'translate(30,' + (vbHeight / 2 - barHeight / 2) + ')')
      .append('rect')
      .attrs({
        class: 'chart-bg',
        rx: 0,
        ry: 0,
        fill: 'gray',
        'clip-path': `url(#${BAR_CLIPPATH_ID})`,
        height: barHeight,
        width: chartWidth,
        x: 0
      });

    this._dataGroup = this._chart
      .append('g')
      .attr('transform', 'translate(30,' + (vbHeight / 2 - barHeight / 2) + ')');
  };

  _removeD3View = () => {
    if (this._chart) {
      this._chart.selectAll('*').remove();
      this._dataGroup = null;
      this._chart = null;
    }
  };

  _recreateD3View = () => {
    this._removeD3View();
    this._createD3View();
  };

  _updateD3ViewData = (data: Object) => {
    const sData = Object.keys(data).sort(); // sort according to keys to keep the color same
    let arrData = [];

    for (let I = 0; I < sData.length; I += 1) {
      arrData.push({ color: colors[I], value: data[sData[I]], key: sData[I] });
    }
    arrData = _.sortBy(arrData, [
      function(o) {
        return o.value;
      }
    ]).reverse();
    const t = d3.transition().duration(750);

    const bars = this._dataGroup.selectAll('rect').data(arrData, d => {
      return d;
    });

    bars
      .exit()
      .transition(t)
      .attr('width', 0)
      .remove();

    bars
      .attr('class', d => {
        return 'chartBar ' + d.key;
      })
      .attr('fill', d => {
        return d.color;
      })
      .transition(t)
      .attr('width', d => {
        return d.value * chartWidth / 100;
      });

    bars
      .enter()
      .append('rect')
      .attrs({
        class: d => {
          return 'chartBar ' + d.key;
        },
        rx: 0,
        ry: 0,
        fill: d => {
          return d.color;
        },
        'clip-path': `url(#${BAR_CLIPPATH_ID})`,
        height: barHeight,
        x: 0
      })

      .on('mouseover', (d) => {
        console.log('d3.event:', d3.event);
        const wRatio = this._chartEl.clientWidth / vbWidth;
        const w = d.value * chartWidth / 100;
        let x = (w * wRatio) + 30 - 8;
        const y = 0;
          console.log('x2, y2:', x, y);
          this._tip.transition()
              .duration(200)
              .style('opacity', 0.9);
          this._tip.html('<strong>' + d.key + ':</strong> <span style="color:red">' + Math.round(d.value) + '</span>');
          const rect = this._tip.node().getBoundingClientRect();
          x -= (rect.width / 2);
          this._tip.style('left', (x) + 'px')
              .style('top', (y) + 'px')
              .style('width', (rect.width) + 'px');
          })
      .on('mouseout', () => {
          this._tip.transition()
              .duration(500)
              .style('opacity', 0);
          })
      .transition(t)
      .attr('width', d => {
        return d.value * chartWidth / 100;
      });
  };

  componentDidMount() {
    // this is a problem to receive _chartEl and _textEl unless we wrap in setTimeout. An react bug?
    setTimeout(() => {
      this._createD3View();

      this._autorunDisposer = autorun(() => {
        const { values } = this.props.widget;
        const latestValue = values.length > 0 ? values[values.length - 1].value : {};

        // // if (items.length !== 1) {
        // //   console.error('ArrowWidget only supports single item');
        // //   return;
        // // }
        //
        // const data = latestValue[items[0]];
        //
        // if (data === undefined) return;
        //
        // if (typeof data !== 'number') {
        //   console.error('ArrowWidget only supports numeric data value');
        //   return;
        // }

        // const testData = {item1: 10, item2: 90};
        this._updateD3ViewData(latestValue);
      });
    }, 200);
  }

  componentDidUpdate() {
    setTimeout(() => {
      this._recreateD3View();
    }, 200);
  }

  componentWillUnmount() {
    this._autorunDisposer && this._autorunDisposer();
    this._removeD3View();
  }

  render() {
    const { widget, widgetStyle } = this.props;

    return (
      <Widget
        className="ProgressBarWidget"
        widget={widget}
        widgetStyle={widgetStyle}
      >
        <svg className="chart" ref={_chartEl => (this._chartEl = _chartEl)} />
        <div className="d3-tip" ref={_tipEl => (this._tipEl = _tipEl)} />
      </Widget>
    );
  }
}
