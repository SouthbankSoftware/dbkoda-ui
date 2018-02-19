/**
 * @flow
 *
 * Created by Mike on 05/2/18.
 * @Last modified by:   wahaj
 * @Last modified time: 2018-02-16T14:53:22+11:00
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

import React from 'react';
import { inject, observer } from 'mobx-react';
import ErrorIcon from '../../../styles/icons/error-icon.svg';

import './StackedRadialWidget.scss';

const colors = [
  '#A27EB7',
  '#DC5D3E',
  '#39B160',
  '#643798',
  '#2E547A',
  '#3333cc'
];

type Props = {
  metrics: any,
  onRef: any,
  colors: string[],
  getValues: () => any,
  showTotal: boolean,
  showValues: boolean,
  showDots: boolean,
  getUnit: () => string
};

@inject(({ store, api }, { widget }) => {
  return {
    store,
    api,
    widget
  };
})
@observer
export default class Legend extends React.Component<Props> {
  static fontSize = 7;
  static rowSize = 20;
  static rowScalingFactor = 600;
  static fontScalingFactor = 500;
  static height = 20;
  static width = 20;

  setValues: () => null;
  state: any;
  colors: string[];

  constructor(props: Props) {
    super(props);

    this.state = {
      items: this.props.metrics,
      values: [],
      width: 100,
      height: 100,
      unit: '',
      colors: []
    };
    if (this.props.colors) {
      this.colors = this.props.colors;
    } else {
      this.colors = colors;
    }

    if (this.props.getValues && this.props.getValues()) {
      this.state.values = this.props.getValues();
    }
    if (this.props.getUnit && this.props.getUnit()) {
      this.state.unit = this.props.getUnit();
    }
    this.setValues = this.setValues.bind(this);
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  setValues(values: Object) {
    // $FlowFixMe
    this.setState({ values });
  }

  resize(width: number, height: number) {
    // $FlowFixMe
    this.setState({ width, height });
  }

  render() {
    let total = 0;

    // Determine size.
    const fontSize =
      Legend.fontSize +
      Legend.fontSize * this.state.width / Legend.fontScalingFactor +
      'px';
    const rowDynamicStyle = {
      height:
        Legend.rowSize +
        Legend.rowSize * this.state.width / Legend.rowScalingFactor * 1.1 +
        'px'
    };
    let totalFontColor = 'white';
    let totalValueFontColor = 'white';
    if (!this.props.showDots) {
      totalFontColor = 'black';
      totalValueFontColor = 'black';
    }

    // Render
    return (
      <div className="keyWrapper">
        {this.state.items.map((item, count) => {
          // Determine Dot color and total count.
          let fontColor = 'white';
          let valueFontColor = 'white';
          if (!this.props.showDots) {
            fontColor = this.colors[count];
            valueFontColor = 'black';
          }
          const style = { fill: this.colors[count] };
          let value = 'Fetching...';
          if (this.state.values[item] || this.state.values[item] === 0) {
            value = parseFloat(Number(this.state.values[item]).toFixed(2));
            value = value + ' ' + this.state.unit;
            total += this.state.values[item];
            total = parseFloat(Number(total).toFixed(2));
          }

          return (
            <div className="row" style={rowDynamicStyle}>
              {this.props.showDots && (
                <div className="dotWrapper">
                  <ErrorIcon className="colorDot" style={style} />
                </div>
              )}
              <div className="labelWrapper">
                <svg className="label">
                  <text
                    x="20"
                    y="20"
                    fontFamily="sans-serif"
                    fontSize={fontSize}
                    fill={fontColor}
                  >
                    {item.match('_') && item.split('_')[1]}
                    {!item.match('_') && item}
                  </text>{' '}
                </svg>
              </div>
              {this.props.showValues && (
                <div className="valueWrapper">
                  <svg className="legendValue">
                    <text
                      x="20"
                      y="20"
                      fontFamily="sans-serif"
                      fontSize={fontSize}
                      fill={valueFontColor}
                    >
                      : {value}
                    </text>{' '}
                  </svg>
                </div>
              )}
            </div>
          );
        })}
        {this.props.showTotal && (
          <div className="row rowTotal" style={rowDynamicStyle}>
            <svg className="label">
              <text
                x="20"
                y="20"
                fontFamily="sans-serif"
                fontSize={fontSize}
                fill={totalFontColor}
              >
                Total:
              </text>:{' '}
            </svg>
            <svg className="legendValue">
              <text
                x="20"
                y="20"
                fontFamily="sans-serif"
                fontSize={fontSize}
                fill={totalValueFontColor}
              >
                {total + ' ' + this.state.unit}
              </text>{' '}
            </svg>
          </div>
        )}
      </div>
    );
  }
}
