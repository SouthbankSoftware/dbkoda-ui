/**
 * Created by joey on 17/1/18.
 * @Last modified by:   wahaj
 * @Last modified time: 2018-02-01T17:15:23+11:00
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

import './StackedRadialWidget.scss';

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
export default class Legend extends React.Component {
  static colors = [
    '#3333cc',
    '#2E547A',
    '#643798',
    '#39B160',
    '#DC5D3E',
    '#A27EB7'
  ];

  constructor(props) {
    super(props);
    this.state = {
      items: this.props.metrics,
      values: []
    };
    this.setValues = this.setValues.bind(this);
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  setValues(values) {
    this.setState({ values });
  }

  render() {
    let total = 0;
    return (
      <div className="keyWrapper">
        {this.state.items.map((item, count) => {
          const style = { backgroundColor: Legend.colors[count] };
          let value = '0';
          if (this.state.values[item]) {
            value = parseInt(this.state.values[item], 10);
            total += this.state.values[item];
          }
          return (
            <div className="row">
              <div className="colorDot" style={style} />
              <div className="label">{item}: </div>
              <div className="legendValue">{value}</div>
            </div>
          );
        })}
        {this.props.showTotal && (
          <div className="row rowTotal">
            <div className="colorDot" />
            <div className="label">Total: </div>
            <div className="legendValue">{total}</div>
          </div>
        )}
      </div>
    );
  }
}
