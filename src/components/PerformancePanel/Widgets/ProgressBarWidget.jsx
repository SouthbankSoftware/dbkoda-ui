/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-02-07T10:55:24+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-02-23T10:39:46+11:00
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
import { inject } from 'mobx-react';
import type { WidgetState } from '~/api/Widget';
import * as d3 from 'd3';
import 'd3-selection-multi';
import { Tooltip, Position } from '@blueprintjs/core';
import Legend from './Legend';
import Widget from './Widget';
import { convertUnits } from './Utils';
import './ProgressBarWidget.scss';

let colors = ['#A27EB7', '#DC5D3E', '#39B160', '#643798', '#2E547A', '#3333cc'];
const BAR_CLIPPATH_ID = 'barCP';
const vbWidth = 400;
const vbHeight = 50;
const barHeight = Math.round(vbHeight * 50 / 100);
const chartWidth = vbWidth - 60;

type Props = {
  widget: WidgetState,
  widgetStyle: *,
  rotate?: number
};

@inject(({ store: { performancePanels }, api }, { profileId }) => {
  const performancePanel = performancePanels.get(profileId);
  return {
    store: {
      performancePanel
    },
    api
  };
})
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
  _totalDivisor: *;
  _chartLabel: *;
  _bVertical: false;
  _unit: *;
  _itemValues: *;

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
        rx: 10,
        ry: 10,
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
    if (this.props.widget.colorList) {
      colors = this.props.widget.colorList;
    }
    // eslint-disable-next-line
    const bVertical = this.props.widget.showVertical === true;
    const sData = Object.keys(data); // .sort(); // sort according to keys to keep the color same
    let arrData = [];
    let sumOfValues = 0;
    if (sData.length > 1) {
      // Case where there are more than 1 data items to display
      for (let I = 0; I < sData.length; I += 1) {
        if (I == 0 && this.props.widget.firstValueIsHighWaterMark) {
          // Discard first value, set high water mark.
          this._totalDivisor = data[sData[I]];
          sumOfValues = data[sData[I]];
        }
        arrData.push({
          color: colors[I],
          value: data[sData[I]],
          key: sData[I]
        });
      }
      if (!this.props.widget.maintainOrder) {
        arrData = _.sortBy(arrData, [
          function(o) {
            return o.value;
          }
        ]);
        arrData = _.reverse(arrData);
      }

      arrData = arrData.map(elem => {
        if (!this.props.widget.firstValueIsHighWaterMark) {
          sumOfValues += elem.value;
          elem.sumValue = sumOfValues;
        } else {
          elem.sumValue = elem.value;
        }
        return elem;
      });
      if (
        !this.props.widget.firstValueIsHighWaterMark ||
        this.props.widget.waterMarkGroup
      ) {
        arrData = _.reverse(arrData);
      }
      this._chartLabel = sumOfValues; // for multi item chart it will show the sum of value in the text label
    } else if (sData.length === 1) {
      // specific case of only one data item
      arrData.push({
        color: colors[0],
        value: data[sData[0]],
        key: sData[0],
        sumValue: data[sData[0]]
      });
      this._chartLabel = arrData[0].value; // for single item chart it will always show the item value in text label
      sumOfValues = arrData[0].value;
    } else {
      // console.error(
      //   'ProgressBarWidget (',
      //   this.props.widget.chartTitle,
      //   ') require atleast one data element'
      // );
      return;
    }
    if (this.props.widget.maxValue) {
      this._totalDivisor = this.props.widget.maxValue; // If maxValue is provided, it will become the total divisor for the bar chart
    } else if (this.props.widget.useHighWaterMark) {
      const newHighWaterMark = Math.ceil(sumOfValues * 1.5);
      if (
        !this._totalDivisor ||
        (this._totalDivisor > 0 && sumOfValues >= this._totalDivisor) // update HighWaterMark only it is not set or smaller then the current sum of values
      ) {
        this._totalDivisor = newHighWaterMark;
      }
    } else if (!this.props.widget.firstValueIsHighWaterMark) {
      this._totalDivisor = sumOfValues;
    }

    // If part of high water mark group, set group value.
    if (this.props.widget.waterMarkGroup) {
      const highestValue = this.props.store.performancePanel
        .highWaterMarkGroups[this.props.widget.waterMarkGroup];
      if (this._totalDivisor > highestValue) {
        this.props.store.performancePanel.highWaterMarkGroups[
          this.props.widget.waterMarkGroup
        ] = this._totalDivisor;
      }
      this._totalDivisor = this.props.store.performancePanel.highWaterMarkGroups[
        this.props.widget.waterMarkGroup
      ];
    }

    const t = d3.transition().duration(750);

    const bars = this._dataGroup.selectAll('rect').data(arrData, d => {
      return d.key; // this return value determines which bars to add/remove/update in the current chart.
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
        const cWidth = d.sumValue / this._totalDivisor * chartWidth;
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
      /* Tooltips.
        .on('mouseover', d => {
        const xScale = bVertical
          ? this._chartEl.clientWidth / vbHeight
          : this._chartEl.clientWidth / vbWidth;
        const yScale = bVertical
          ? this._chartEl.clientHeight / vbWidth
          : this._chartEl.clientHeight / vbHeight;
        const wRatio = xScale < yScale ? xScale : yScale;
        const w = d.sumValue / this._totalDivisor * chartWidth;
        let xDiff =
          ((bVertical
            ? this._chartEl.clientHeight
            : this._chartEl.clientWidth) -
            chartWidth * wRatio) /
          2;
        const yDiff =
          ((bVertical
            ? this._chartEl.clientWidth
            : this._chartEl.clientHeight) -
            barHeight * wRatio) /
          2;
        if (this._chartEl.previousSibling) {
          xDiff += this._chartEl.previousSibling.clientWidth;
        }
        let x = w * wRatio + xDiff;
        let y = yDiff - 20;
        this._tip
          .transition()
          .duration(200)
          .style('opacity', 0.9);
        const strTipValue =
          String(d.value).indexOf('.') >= 0
            ? Number(d.value).toFixed(2)
            : d.value;
        const strTipLabel = convertUnits(strTipValue, this._unit, 3);
        this._tip.html(
          '<strong>' +
            d.key +
            ':</strong> <span style="color:red">' +
            strTipLabel.value +
            ' ' +
            strTipLabel.unit +
            '</span>'
        );
        const strWidth = String(d.key + ': ' + strTipValue).length * 8;

        if (bVertical) {
          y += barHeight * wRatio * 2;
          this._tip
            .style('left', y + 'px')
            .style('bottom', x - 20 + 'px')
            .style('width', strWidth + 10 + 'px');
        } else {
          x -= strWidth / 2;
          this._tip
            .style('left', x - 10 + 'px')
            .style('top', y + 'px')
            .style('width', strWidth + 10 + 'px');
        }
      })
      .on('mouseout', () => {
        this._tip
          .transition()
          .duration(500)
          .style('opacity', 0);
      }) */
      .transition(t)
      .attr('width', d => {
        const cWidth = d.sumValue / this._totalDivisor * chartWidth;
        return isNaN(cWidth) || cWidth < 0 ? 0 : cWidth;
      });

    const lblValue = convertUnits(this._chartLabel, this._unit, 3);
    d3.select(this._chartTotalEl).text(lblValue.value + ' ' + lblValue.unit);
  };

  componentDidMount() {
    // this is a problem to receive _chartEl and _textEl unless we wrap in setTimeout. An react bug?
    setTimeout(() => {
      const bVertical = this.props.widget.showVertical === true;
      this._createD3View(bVertical);

      this._autorunDisposer = autorun(() => {
        const { values, unit } = this.props.widget;
        const latestValue =
          values.length > 0 ? values[values.length - 1].value : {};

        // const testData = {'item-001': 15, 'item-002': 130};
        this._itemValues = latestValue;
        this._unit = unit;
        this._updateD3ViewData(latestValue);
        if (this.toolTipLegend && this.hasRendered && this._itemValues) {
          this.toolTipLegend.setValues(this._itemValues);
        }
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
    if (this.props.widget.colorList) {
      colors = this.props.widget.colorList;
    }
    const { widget, widgetStyle } = this.props;
    const { chartTitle, showVertical } = widget;
    const chartTotalStyle = { top: '40%' };
    if (showVertical) {
      chartTotalStyle.top = '50%';
    }
    setTimeout(() => {
      this.hasRendered = true;
    }, 200);
    return (
      <Widget widget={widget} widgetStyle={widgetStyle}>
        <div className="ProgressBarWidget">
          <Tooltip
            portalClassName="StackedRadialWidgetTooltip"
            className="toolTip"
            content={
              <div className="Tooltip">
                <Legend
                  showTotal
                  showValues
                  colors={colors}
                  showDots
                  metrics={this.props.widget.items}
                  unit={this._unit}
                  getValues={() => {
                    return this._itemValues;
                  }}
                  getUnit={() => {
                    return this._unit;
                  }}
                  onRef={toolTipLegend => {
                    this.toolTipLegend = toolTipLegend;
                  }}
                />
              </div>
            }
            position={Position.BOTTOM}
            useSmartPositioning
          >
            <div className="container">
              <div className="chart-label">
                {chartTitle && <strong>{chartTitle}</strong>}
              </div>
              <svg
                className="chart"
                ref={_chartEl => (this._chartEl = _chartEl)}
              />
              <div className="chart-total">
                <span
                  ref={_chartTotalEl => (this._chartTotalEl = _chartTotalEl)}
                  style={chartTotalStyle}
                />
              </div>
            </div>
          </Tooltip>
          <div className="d3-tip-top" ref={_tipEl => (this._tipEl = _tipEl)} />
          <div
            className="d3-tip-right"
            ref={_tipREl => (this._tipREl = _tipREl)}
          />
        </div>
      </Widget>
    );
  }
}
