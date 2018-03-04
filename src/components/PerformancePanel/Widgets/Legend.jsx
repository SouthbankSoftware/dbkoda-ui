/**
 * @flow
 *
 * Created by Mike on 05/2/18.
 * @Last modified by:   guiguan
 * @Last modified time: 2018-03-04T18:28:26+11:00
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
import { observer } from 'mobx-react';
import ErrorIcon from '../../../styles/icons/circle.svg';
import { convertUnits } from './Utils';

import './StackedRadialWidget.scss';

const colors = ['#AC8BC0', '#E26847', '#42BB6D', '#7040A3', '#365F87'];

type Props = {
  metrics: any,
  onRef: any,
  colors: any,
  getValues: () => any,
  showTotal: boolean,
  showValues: boolean,
  showDots: boolean,
  getUnit: () => any
};

@observer
export default class Legend extends React.Component<Props> {
  static fontSize = 7;
  static rowSize = 22;
  static rowScalingFactor = 900;
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
      Legend.fontSize + Legend.fontSize * this.state.height / Legend.fontScalingFactor + 'px';
    const rowDynamicStyle = {
      height: Legend.rowSize + Legend.rowSize * this.state.width / Legend.rowScalingFactor + 'px'
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
            // value = value + ' ' + this.state.unit;
            total += this.state.values[item];
            total = parseFloat(Number(total).toFixed(2));
          }

          let itemString = item;
          if (itemString.match('_')) {
            itemString = itemString.split('_')[1];
          }
          if (itemString.match(/UsPs$/g)) {
            itemString = itemString.substring(0, itemString.length - 4);
          } else if (itemString.match(/Us$|Ps$/g)) {
            itemString = itemString.substring(0, itemString.length - 2);
          }
          return (
            <div className="row" style={rowDynamicStyle}>
              {this.props.showDots && (
                <div className="dotWrapper">
                  <ErrorIcon className="colorDot" style={style} />
                </div>
              )}
              <div className="labelWrapper">
                <div className="label">
                  <span
                    x="20"
                    y="20"
                    fontFamily="sans-serif"
                    fontSize={fontSize}
                    fill={fontColor}
                    className="labelText"
                  >
                    {itemString}
                    {this.props.showValues && ':'}
                  </span>{' '}
                </div>
              </div>
              {this.props.showValues && (
                <div className="valueWrapper">
                  <div className="legendValue">
                    <span
                      x="20"
                      y="20"
                      fontFamily="sans-serif"
                      fontSize={fontSize}
                      fill={valueFontColor}
                      className="valueText"
                    >
                      {convertUnits(value, this.props.getUnit(), 3).value}{' '}
                      {convertUnits(value, this.props.getUnit(), 3).unit}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {this.props.showTotal && (
          <div className="row rowTotal" style={rowDynamicStyle}>
            <div className="label">
              <span
                x="20"
                y="20"
                fontFamily="sans-serif"
                fontSize={fontSize}
                fill={totalFontColor}
                className="totalText"
              >
                Total:
              </span>:{' '}
            </div>
            <div className="legendValue">
              <span
                x="20"
                y="20"
                fontFamily="sans-serif"
                fontSize={fontSize}
                fill={totalValueFontColor}
                className="totalTextValue"
              >
                {convertUnits(total, this.props.getUnit(), 3).value}{' '}
                {convertUnits(total, this.props.getUnit(), 3).unit}
              </span>{' '}
            </div>
          </div>
        )}
      </div>
    );
  }
}
