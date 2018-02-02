/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-01-31T16:32:29+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-02-02T13:29:17+11:00
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
import { autorun } from 'mobx';
import { inject } from 'mobx-react';
import type { WidgetState } from '~/api/Widget';
import * as d3 from 'd3';
// $FlowFixMe
import 'd3-selection-multi';
import Widget from './Widget';
import styles from './ArrowWidget.scss';

const ARROW_MASK_ID = 'ArrowWidget-arrowMask';
const GRADIENT_ID = 'ArrowWidget-gradient';

// these dimensions are only used at drawing time. The svg will automatically adapt to its container
// size
const width = 300;
const height = 375;
const headYPropotion = 0.5;
const tailXPropotion = 0.4;
const strokeWidth = width * 0.04;
const halfStrokeWidth = strokeWidth / 2;
const headTailY = (height - strokeWidth) * headYPropotion + halfStrokeWidth;
const arrowMaskPathDes = `M${width / 2},${halfStrokeWidth}L${width -
  halfStrokeWidth},${headTailY}H${(width - strokeWidth) * (1 + tailXPropotion) / 2 +
  halfStrokeWidth}V${height - halfStrokeWidth}H${(width - strokeWidth) * (1 - tailXPropotion) / 2 +
  halfStrokeWidth}V${headTailY}H${halfStrokeWidth}Z`;

type Store = {
  widget: WidgetState
};

type Props = {
  store: any | Store,
  id: UUID,
  rotate?: number
};

@inject(({ store: { widgets } }, { id }) => {
  const widget = widgets.get(id);

  return {
    store: {
      widget
    }
  };
})
export default class ArrowWidget extends React.Component<Props> {
  _chartEl: *;
  _textEl: *;
  _chart: *;
  _valueRec: *;
  _autorunDisposer: *;

  static defaultProps = {
    store: null
  };

  _createD3View = () => {
    this._chart = d3.select(this._chartEl).attrs({
      width: '100%',
      height: '100%',
      viewBox: `0 0 ${width} ${height}`,
      perserveAspectRatio: 'xMinYMid'
    });

    if (!this._chart) return;

    // $FlowFixMe
    const rotate = this.props.rotate || this.props.store.widget.rotate;

    if (typeof rotate === 'number') {
      this._chart.attr('transform', `rotate(${rotate})`);
    }

    const defs = this._chart.append('defs');

    defs
      .append('mask')
      .attr('id', ARROW_MASK_ID)
      .append('path')
      .attrs({
        stroke: 'white',
        'stroke-width': strokeWidth,
        'stroke-linejoin': 'round',
        fill: 'white',
        d: arrowMaskPathDes
      });

    const gradient = defs.append('linearGradient').attrs({
      id: GRADIENT_ID,
      x1: '50%',
      y1: '100%',
      x2: '50%',
      y2: '0%',
      spreadMethod: 'pad'
    });

    gradient.append('stop').attrs({
      offset: '0%',
      'stop-color': styles.progressBarGradientStartColour,
      'stop-opacity': 1
    });

    gradient.append('stop').attrs({
      offset: '100%',
      'stop-color': styles.progressBarGradientStopColour,
      'stop-opacity': 1
    });

    // $FlowIssue
    this._chart.append('rect').attrs({
      x: 0,
      y: 0,
      width,
      height,
      fill: `url(#${GRADIENT_ID})`,
      mask: `url(#${ARROW_MASK_ID})`
    });

    // $FlowIssue
    this._valueRec = this._chart.append('rect').attrs({
      x: 0,
      y: 0,
      width,
      height,
      fill: styles.backgroundColour,
      mask: `url(#${ARROW_MASK_ID})`
    });
  };

  _removeD3View = () => {
    if (this._chart) {
      this._chart.selectAll('*').remove();
      this._valueRec = null;
      this._chart = null;
    }
  };

  _recreateD3View = () => {
    this._removeD3View();
    this._createD3View();
  };

  _updateD3ViewData = (data: number) => {
    // $FlowIssue
    this._textEl && (this._textEl.innerHTML = `${data.toFixed(0)}%`);
    this._valueRec &&
      this._valueRec.transition().attrs({
        y: -data / 100 * height
      });
  };

  componentDidMount() {
    // this is a problem to receive _chartEl and _textEl unless we wrap in setTimeout. An react bug?
    setTimeout(() => {
      this._createD3View();

      this._autorunDisposer = autorun(() => {
        const { items, values } = this.props.store.widget;
        const latestValue = values.length > 0 ? values[values.length - 1].value : {};

        if (items.length !== 1) {
          console.error('ArrowWidget only supports single item');
          return;
        }

        const data = latestValue[items[0]];

        if (typeof data !== 'number') {
          console.error('ArrowWidget only supports numeric data value');
          return;
        }

        this._updateD3ViewData(data);
      });
    }, 200);
  }

  componentDidUpdate() {
    setTimeout(() => {
      this._removeD3View();
      this._createD3View();
    }, 200);
  }

  componentWillUnmount() {
    this._autorunDisposer && this._autorunDisposer();
    this._removeD3View();
  }

  render() {
    const { id } = this.props;

    return (
      <Widget className="ArrowWidget" id={id}>
        <svg className="chart" ref={_chartEl => (this._chartEl = _chartEl)} />
        <div className="text" ref={_textEl => (this._textEl = _textEl)}>
          0%
        </div>
      </Widget>
    );
  }
}
