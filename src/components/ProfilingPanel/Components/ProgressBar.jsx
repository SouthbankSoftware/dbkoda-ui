/**
 *
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-02-07T10:55:24+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-04-16T16:10:28+10:00
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
import * as d3 from 'd3';
import 'd3-selection-multi';
import { convertUnits } from '#/PerformancePanel/Widgets/Utils';

const colors = ['#476A8E', '#DC5D3E', '#39B160', '#643798', '#2E547A', '#3333cc'];
const BAR_CLIPPATH_ID = 'barCP';
const vbWidth = 250;
const vbHeight = 30;
const barHeight = Math.round(vbHeight * 60 / 100);
const chartWidth = vbWidth - 60;

type Props = {
  waterMark: any,
  value: any,
  unit: any,
  chartTitle: any
};

export default class ProgressBar extends React.Component<Props> {
  _chartEl: *;
  _chart: *;
  _dataGroup: *;
  _tip: *;
  _totalDivisor: *;
  _unit: any;

  _createD3View = () => {
    this._tip = d3
      .select('body')
      .append('div')
      .attr('class', 'd3-tip-top')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('z-index', 1000);

    this._chart = d3.select(this._chartEl).attrs({
      width: '100%',
      height: '100%',
      viewBox: `0 0 ${vbWidth} ${vbHeight}`,
      perserveAspectRatio: 'xMinYMid'
    });

    if (!this._chart) return;

    const defs = this._chart.append('defs');

    // defined a clippath to clip unwanted area from rendering
    defs
      .append('clipPath')
      .attr('id', BAR_CLIPPATH_ID)
      .append('rect')
      .attrs({
        rx: 10,
        ry: 10,
        height: barHeight - 2,
        width: chartWidth,
        x: 0,
        y: 1
      });

    const posTransY = vbHeight / 2 - barHeight / 2;
    // chart background
    // $FlowFixMe
    const chartBG = this._chart.append('g').attr('transform', `translate(30, ${posTransY})`);
    chartBG.append('rect').attrs({
      class: 'chart-bg',
      rx: 0,
      ry: 0,
      fill: '#2F4455',
      'clip-path': `url(#${BAR_CLIPPATH_ID})`,
      height: barHeight,
      width: chartWidth,
      x: 0
    });
    // $FlowFixMe
    this._dataGroup = this._chart.append('g').attr('transform', `translate(30, ${posTransY})`);
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
    // eslint-disable-next-line
    const sData = Object.keys(data); // .sort(); // sort according to keys to keep the color same
    const arrData = [];
    if (sData.length === 1) {
      // specific case of only one data item
      // $FlowFixMe
      arrData.push({
        // $FlowFixMe
        color: colors[0],
        value: data[sData[0]],
        key: sData[0],
        sumValue: data[sData[0]],
        displayOrder: 0
      });
    } else {
      return;
    }

    // $FlowFixMe
    const t = d3.transition().duration(750);

    // $FlowFixMe
    const bars = this._dataGroup.selectAll('rect').data(arrData, d => {
      return d.value; // this return value determines which bars to add/remove/update in the current chart.
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
        return d3.hsl(d.color);
      })
      .transition(t)
      .attr('width', d => {
        const perc = d.sumValue / this._totalDivisor;
        const cWidth = Math.min(perc, 1) * chartWidth;
        return isNaN(cWidth) || cWidth < 0 ? 0 : cWidth;
      });

    bars
      .enter()
      .append('rect')
      .attrs({
        class: d => {
          return 'chartBar ' + d.key;
        },
        rx: 10,
        ry: 10,
        fill: d => {
          return d3.hsl(d.color);
        },
        'clip-path': `url(#${BAR_CLIPPATH_ID})`,
        height: barHeight,
        x: 0
      })
      .on('mouseover', d => {
        d3
          .selectAll('.d3-tip-top')
          .transition()
          .duration(500)
          .style('opacity', 0)
          .style('z-index', -1);
        this._tip
          .transition()
          .duration(200)
          .style('opacity', 0.9)
          .style('z-index', 1000);
        const strTipValue =
          String(d.value).indexOf('.') >= 0 ? Number(d.value).toFixed(2) : d.value;
        const strTipLabel = convertUnits(strTipValue, this._unit, 3);
        this._tip.html(
          '<strong>' + d.key + ':</strong> <span style="color:red">' + strTipLabel.value + '</span>'
        );
        const strWidth = String(d.key + ': ' + strTipValue).length * 8;

        this._tip
          .style('left', d3.event.pageX - strWidth / 2 + 'px')
          .style('top', d3.event.pageY - 28 + 'px')
          .style('width', strWidth + 10 + 'px');
      })
      .on('mouseout', () => {
        if (d3.event.relatedTarget.className !== 'd3-tip-top') {
          this._tip
            .transition()
            .duration(500)
            .style('opacity', 0)
            .style('z-index', -1);
        }
      })
      .transition(t)
      .attr('width', d => {
        const cWidth = d.sumValue / this._totalDivisor * chartWidth;
        return isNaN(cWidth) || cWidth < 0 ? 0 : cWidth;
      });
  };

  componentDidMount() {
    // this is a problem to receive _chartEl and _textEl unless we wrap in setTimeout. An react bug?
    setTimeout(() => {
      this._createD3View();

      const { value, unit, waterMark } = this.props;
      if (!value) {
        return;
      }

      this._unit = unit;
      this._totalDivisor = waterMark;
      this._updateD3ViewData(value);
    }, 200);
  }

  componentDidUpdate() {
    setTimeout(() => {
      // this._recreateD3View();
      const { value, unit, waterMark } = this.props;
      if (!value) {
        return;
      }

      this._unit = unit;
      this._totalDivisor = waterMark;
      this._updateD3ViewData(value);
    }, 200);
  }

  componentWillUnmount() {
    this._removeD3View();
  }

  render() {
    const { chartTitle } = this.props;

    return (
      <div className="ProgressBarWidget">
        <div className="container">
          {chartTitle && (
            <div className="chart-label">
              <strong>{chartTitle}</strong>
            </div>
          )}
          <svg className="chart" ref={_chartEl => (this._chartEl = _chartEl)} />
        </div>
      </div>
    );
  }
}
