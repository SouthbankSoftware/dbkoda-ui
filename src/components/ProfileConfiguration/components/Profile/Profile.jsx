/**
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
import {Radio, RadioGroup, NumericInput} from '@blueprintjs/core';

import './Profile.scss';

export default class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {db: {was: 0}, selectedValue: -1, exceedLimit: 1000000};
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.db) {
      const {db} = nextProps;
      this.setState({db});
    }
  }

  getSelectedValue() {
    if (this.state.selectedValue >= 0) {
      return this.state.selectedValue;
    }
    switch (this.state.db.was) {
      case 0:
        return 2;
      case 1:
        return 1;
      case 2:
        return 0;
      default:
        return 0;
    }
  }

  onChange = e => {
    this.setState({selectedValue: parseInt(e.target.value, 10)});
  };

  render() {
    const selectedValue = this.getSelectedValue();
    return (
      <div className="db-profiling-detailed-panel">
        <div className="profiling-label profiling-title">
          {globalString('performance/profiling/configuration/profile-mode')}
        </div>
        {/* <RadioGroup selectedValue={selectedValue} onChange={this.onChange}> */}
        <Radio
          value={0}
          checked={selectedValue === 0}
          onChange={this.onChange}
          className="profiling-label"
          label={globalString(
            'performance/profiling/configuration/profile-all'
          )}
        />
        <div className="exceeding-limit-panel">
          <Radio
            value={1}
            onChange={this.onChange}
            checked={selectedValue === 1}
            className="profiling-label"
            label={globalString(
              'performance/profiling/configuration/operation-exceeds'
            )}
          />

          <NumericInput />
        </div>
        <Radio
          value={2}
          onChange={this.onChange}
          className="profiling-label"
          checked={selectedValue === 2}
          label={globalString(
            'performance/profiling/configuration/profiling-off'
          )}
        />
        {/* </RadioGroup> */}
      </div>
    );
  }
}
