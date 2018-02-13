/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-02-07T10:55:24+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-02-13T12:58:54+11:00
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
  _tipREl: *;
  _tip: *;
  _chartTotalEl: *;
  _sumOfValues: *;
  _bVertical: false;

  _createD3View = (bVertical: boolean) => {
    if (bVertical) {
      this._bVertical = bVertical;
      this._tip = d3.select(this._tipREl).style('opacity', 0);
      d3.select(this._tipEl).style('opacity', 0);
    } else {
      this._tip = d3.select(this._tipEl).style('opacity', 0);
      d3.select(this._tipREl).style('opacity', 0);
    }
    this._chart = d3.select(this._chartEl).attrs({
      width: '100%',
      height: '100%',
      viewBox: this._bVertical
        ? `0 0 ${vbHeight} ${vbWidth}`
        : `0 0 ${vbWidth} ${vbHeight}`,
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
        rx: 15,
        ry: 15,
        height: barHeight - 2,
        width: chartWidth,
        x: 0,
        y: 1
      });

    const posTransY = vbHeight / 2 - barHeight / 2;
    // chart background
    const chartBG = this._chart
      .append('g')
      .attr('transform', `translate(30, ${posTransY})`);
    chartBG.append('rect').attrs({
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
      .attr('transform', `translate(30, ${posTransY})`);

    if (this._bVertical) {
      const rotatePos = vbWidth / 2 - barHeight;
      chartBG.attr(
        'transform',
        `translate(30, ${posTransY}) rotate(270 ${rotatePos} ${rotatePos})`
      );
      this._dataGroup.attr(
        'transform',
        `translate(30, ${posTransY}) rotate(270 ${rotatePos} ${rotatePos})`
      );
    }
  };

  _removeD3View = () => {
    if (this._chart) {
      this._chart.selectAll('*').remove();
      this._dataGroup = null;
      this._chart = null;
    }
  };

  _recreateD3View = () => {
    const bVertical = this.props.widget.showVertical === true;
    this._removeD3View();
    this._createD3View(bVertical);
  };

  _updateD3ViewData = (data: Object) => {
    const bVertical = this.props.widget.showVertical === true;
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
    this._sumOfValues = 0;
    arrData = arrData.map(elem => {
      elem.sumValue = this._sumOfValues + elem.value;
      this._sumOfValues += elem.value;
      return elem;
    });
    arrData = _.reverse(arrData);
    const t = d3.transition().duration(750);

    const bars = this._dataGroup.selectAll('rect').data(arrData, d => {
      return d.sumValue;
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
        return d.sumValue / this._sumOfValues * chartWidth;
      });

    bars
      .enter()
      .append('rect')
      .attrs({
        class: d => {
          return 'chartBar ' + d.key;
        },
        rx: 15,
        ry: 15,
        fill: d => {
          return d.color;
        },
        'clip-path': `url(#${BAR_CLIPPATH_ID})`,
        height: barHeight,
        x: 0
      })

      .on('mouseover', d => {
        const wRatio = bVertical
          ? this._chartEl.clientHeight / vbWidth
          : this._chartEl.clientWidth / vbWidth;
        const w = d.sumValue / this._sumOfValues * chartWidth;
        let x = w * wRatio + (bVertical ? 50 : 100);
        this._tip
          .transition()
          .duration(200)
          .style('opacity', 0.9);
        this._tip.html(
          '<strong>' +
            d.key +
            ':</strong> <span style="color:red">' +
            Math.round(d.value) +
            '</span>'
        );
        const strWidth = String(d.key + ': ' + Math.floor(d.value)).length * 8;
        x -= strWidth / 2;
        if (bVertical) {
          this._tip
            .style('left', '60px')
            .style('bottom', x + 'px')
            .style('width', strWidth + 10 + 'px');
        } else {
          this._tip
            .style('left', x + 'px')
            .style('top', '5px')
            .style('width', strWidth + 10 + 'px');
        }
      })
      .on('mouseout', () => {
        this._tip
          .transition()
          .duration(500)
          .style('opacity', 0);
      })
      .transition(t)
      .attr('width', d => {
        return d.sumValue / this._sumOfValues * chartWidth;
      });

    d3.select(this._chartTotalEl).text(Math.floor(this._sumOfValues));
  };

  componentDidMount() {
    // this is a problem to receive _chartEl and _textEl unless we wrap in setTimeout. An react bug?
    setTimeout(() => {
      const bVertical = this.props.widget.showVertical === true;
      this._createD3View(bVertical);

      this._autorunDisposer = autorun(() => {
        const { values } = this.props.widget;
        const latestValue =
          values.length > 0 ? values[values.length - 1].value : {};

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

        // const testData = {'item-001': 15, 'item-002': 130};
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
    const { showHorizontalRule, chartTitle, showVertical } = widget;
    const chartTotalStyle = { top: '40%' };
    if (showVertical) {
      chartTotalStyle.top = '50%';
    }
    // const containerStyle = {};
    // let topC = 0;
    // if (name) {
    //   topC += 26;
    // }
    // containerStyle.top = topC + 'px';
    // if (showHorizontalRule) {
    //   topC += 2;
    // }
    // containerStyle.height = 'calc(100% - ' + topC + 'px)';
    return (
      <Widget
        className="ProgressBarWidget"
        widget={widget}
        widgetStyle={widgetStyle}
      >
        <div className="container">
          {chartTitle && (
            <div className="chart-label">
              <strong>{chartTitle}</strong>
            </div>
          )}
          <svg className="chart" ref={_chartEl => (this._chartEl = _chartEl)} />
          <div className="chart-total">
            <span
              ref={_chartTotalEl => (this._chartTotalEl = _chartTotalEl)}
              style={chartTotalStyle}
            />
          </div>
        </div>
        {showHorizontalRule && <hr />}
        <div className="d3-tip-top" ref={_tipEl => (this._tipEl = _tipEl)} />
        <div
          className="d3-tip-right"
          ref={_tipREl => (this._tipREl = _tipREl)}
        />
      </Widget>
    );
  }
}
