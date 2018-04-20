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
import {
  Radio,
  NumericInput,
  Tooltip,
  Intent,
  Position,
} from '@blueprintjs/core';

import './Profile.scss';

export default class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.defaultOptions = {
      selectedDb: {value: {was: 0}},
      selectedValue: -1,
      exceedLimit: 100,
      profileCollectionSize: 1000000,
    };
    this.state = {...this.defaultOptions};
  }

  componentDidMount() {
    this.applySelectedDatabase(this.props.selectedDb);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedDb) {
      if (nextProps.selectedDb.name !== this.state.selectedDb.name) {
        this.applySelectedDatabase(nextProps.selectedDb);
        this.applyExceedLimits(nextProps.selectedDb);
        this.applyCollectionSize(nextProps.selectedDb);
      }
    } else {
      this.setState({...this.defaultOptions});
    }
  }

  applySelectedDatabase(selectedDb) {
    console.log('selected db', selectedDb);
    if (selectedDb) {
      const selectedValue = this.getSelectedValueFromWas(selectedDb.value.was);
      this.setState({selectedDb, selectedValue});
    }
  }

  applyExceedLimits(selectedDb) {
    if (selectedDb) {
      this.setState({exceedLimit: selectedDb.value.slowms});
    }
  }

  applyCollectionSize(selectedDb) {
    if (selectedDb) {
      this.setState({profileCollectionSize: selectedDb.value.size});
    }
  }

  getSelectedValue() {
    if (this.state.selectedValue >= 0) {
      return this.state.selectedValue;
    }
    return this.getSelectedValueFromWas(this.state.selectedDb.value.was);
  }

  getSelectedValueFromWas(was) {
    switch (was) {
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
        <div>
          <Tooltip
            className=""
            content={globalString(
              'performance/profiling/configuration/tooltip/level2'
            )}
            hoverOpenDelay={1000}
            intent={Intent.PRIMARY}
            position={Position.TOP}
          >
            <Radio
              value={0}
              checked={selectedValue === 0}
              onChange={this.onChange}
              className="profiling-label profile-all"
              label={globalString(
                'performance/profiling/configuration/profile-all'
              )}
            />
          </Tooltip>
        </div>
        <div className="exceeding-limit-panel">
          <Tooltip
            className=""
            content={globalString(
              'performance/profiling/configuration/tooltip/level1'
            )}
            hoverOpenDelay={1000}
            intent={Intent.PRIMARY}
            position={Position.TOP}
          >
            <Radio
              value={1}
              onChange={this.onChange}
              checked={selectedValue === 1}
              className="profiling-label operation-exceeds"
              label={globalString(
                'performance/profiling/configuration/operation-exceeds'
              )}
            />
          </Tooltip>
          <NumericInput value={this.state.exceedLimit} />
          <div className="profiling-label">ms</div>
        </div>
        <div>
          <Tooltip
            className=""
            content={globalString(
              'performance/profiling/configuration/tooltip/level0'
            )}
            hoverOpenDelay={1000}
            intent={Intent.PRIMARY}
            position={Position.TOP}
          >
            <Radio
              value={2}
              onChange={this.onChange}
              className="profiling-label"
              checked={selectedValue === 2}
              label={globalString(
                'performance/profiling/configuration/profiling-off'
              )}
            />
          </Tooltip>
        </div>
        <div className="exceeding-limit-panel">
          <div className="profiling-label collection-size">
            {globalString(
              'performance/profiling/configuration/profile-collection-size'
            )}
          </div>
          <NumericInput
            className="size-limit"
            value={this.state.profileCollectionSize}
          />
          <div className="profiling-label">Byte</div>
        </div>
        <div className="profiling-label profile-size-warning">
          {globalString(
            'performance/profiling/configuration/system-profile-size-warning'
          )}
        </div>
        <div className="button-group">
          <button
            className="profile-button profile-button-apply"
            onClick={() => {}}
          >
            {globalString('performance/profiling/configuration/apply')}
          </button>
          <button
            className="profile-button profile-button-cancel"
            onClick={() => this.props.showPerformancePanel()}
          >
            {globalString('performance/profiling/configuration/cancel')}
          </button>
        </div>
      </div>
    );
  }
}
