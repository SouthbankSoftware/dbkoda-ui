/**
 * @flow
 *
 * Created by Mike on 05/2/18.
 * @Last modified by:   Mike
 * @Last modified time: 2018-06-02T17:15:23+11:00
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

type Props = {
  metrics: any,
  onRef: any,
  showTotal: any
};

@inject(({ store, api }, { widget }) => {
  return {
    store,
    api,
    widget
  };
})
@observer
/**
 * TODO: @joey please enable flow
 */
export default class Legend extends React.Component<Props> {
  static colors = [
    '#3333cc',
    '#2E547A',
    '#643798',
    '#39B160',
    '#DC5D3E',
    '#A27EB7'
  ];

  static fontSize = 7;
  static rowSize = 20;
  static rowScalingFactor = 600;
  static fontScalingFactor = 500;
  static height = 20;
  static width = 20;

  setValues: () => null;
  state: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      items: this.props.metrics,
      values: [],
      width: 100,
      height: 100
    };
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
        Legend.rowSize * this.state.width / Legend.rowScalingFactor * 1.2 +
        'px'
    };
    // Render
    return (
      <div className="keyWrapper">
        {this.state.items.map((item, count) => {
          // Determine Dot color and total count.
          const style = { fill: Legend.colors[count] };
          let value = '0';
          if (this.state.values[item]) {
            value = parseInt(this.state.values[item], 10);
            total += this.state.values[item];
          }

          return (
            <div className="row" style={rowDynamicStyle}>
              <ErrorIcon className="colorDot" style={style} />
              <svg className="label">
                <text
                  x="20"
                  y="20"
                  fontFamily="sans-serif"
                  fontSize={fontSize}
                  fill="white"
                >
                  {item}:
                </text>{' '}
              </svg>
              <svg className="legendValue">
                <text
                  x="20"
                  y="20"
                  fontFamily="sans-serif"
                  fontSize={fontSize}
                  fill="white"
                >
                  {value}
                </text>{' '}
              </svg>
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
                fill="white"
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
                fill="white"
              >
                {total}
              </text>{' '}
            </svg>
          </div>
        )}
      </div>
    );
  }
}
