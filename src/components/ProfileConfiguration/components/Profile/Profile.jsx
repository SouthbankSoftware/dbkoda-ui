/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-04-26T09:55:47+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-04-26T15:42:36+10:00
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
import { Radio, NumericInput, Tooltip, Intent, Position } from '@blueprintjs/core';

import './Profile.scss';

export default class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.defaultOptions = {
      selectedDb: { value: { was: 0 } },
      selectedValue: -1,
      exceedLimit: 100,
      profileCollectionSize: 1000000
    };
    this.state = { ...this.defaultOptions };
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
      this.setState({ ...this.defaultOptions });
    }
  }

  applySelectedDatabase(selectedDb) {
    console.log('selected db', selectedDb);
    if (selectedDb) {
      const selectedValue = selectedDb.value.was;
      this.setState({ selectedDb, selectedValue });
    }
  }

  applyExceedLimits(selectedDb) {
    if (selectedDb && selectedDb.value.slowms) {
      this.setState({ exceedLimit: selectedDb.value.slowms });
    }
  }

  applyCollectionSize(selectedDb) {
    if (selectedDb && selectedDb.value.size) {
      this.setState({ profileCollectionSize: selectedDb.value.size });
    }
  }

  getSelectedValue() {
    if (this.state.selectedValue >= 0) {
      return this.state.selectedValue;
    }
    return this.state.selectedDb.value.was;
  }

  onChange = e => {
    this.setState({ selectedValue: parseInt(e.target.value, 10) });
  };

  commitProfileConfiguration = () => {
    const { selectedValue, exceedLimit, profileCollectionSize } = this.state;
    this.props.commitProfileConfiguration({
      level: selectedValue,
      slowms: exceedLimit,
      profileSize: profileCollectionSize
    });
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
            content={globalString('performance/profiling/configuration/tooltip/level2')}
            hoverOpenDelay={1000}
            intent={Intent.PRIMARY}
            position={Position.TOP}
          >
            <Radio
              value={2}
              checked={selectedValue === 2}
              onChange={this.onChange}
              className="profiling-label profile-all"
              label={globalString('performance/profiling/configuration/profile-all')}
            />
          </Tooltip>
        </div>
        <div className="exceeding-limit-panel">
          <Tooltip
            className=""
            content={globalString('performance/profiling/configuration/tooltip/level1')}
            hoverOpenDelay={1000}
            intent={Intent.PRIMARY}
            position={Position.TOP}
          >
            <Radio
              value={1}
              onChange={this.onChange}
              checked={selectedValue === 1}
              className="profiling-label operation-exceeds"
              label={globalString('performance/profiling/configuration/operation-exceeds')}
            />
          </Tooltip>
          <NumericInput
            value={this.state.exceedLimit}
            stepSize={10}
            majorStepSize={100}
            selectAllOnFocus
            min={1}
            onValueChange={v => this.setState({ exceedLimit: v })}
          />
          <div className="profiling-label">ms</div>
        </div>
        <div>
          <Tooltip
            className=""
            content={globalString('performance/profiling/configuration/tooltip/level0')}
            hoverOpenDelay={1000}
            intent={Intent.PRIMARY}
            position={Position.TOP}
          >
            <Radio
              value={0}
              onChange={this.onChange}
              className="profiling-label"
              checked={selectedValue === 0}
              label={globalString('performance/profiling/configuration/profiling-off')}
            />
          </Tooltip>
        </div>
        <div className="exceeding-limit-panel">
          <Tooltip
            className=""
            content={globalString('performance/profiling/configuration/tooltip/collection-size')}
            hoverOpenDelay={1000}
            intent={Intent.PRIMARY}
            position={Position.TOP}
          >
            <div className="profiling-label collection-size">
              {globalString('performance/profiling/configuration/profile-collection-size')}
            </div>
          </Tooltip>
          <NumericInput
            className="size-limit"
            stepSize={1000}
            majorStepSize={1000000}
            min={1000}
            onValueChange={v => this.setState({ profileCollectionSize: v })}
            value={this.state.profileCollectionSize}
          />
          <div className="profiling-label">Byte</div>
        </div>
        <div className="profiling-label profile-size-warning">
          {globalString('performance/profiling/configuration/system-profile-size-warning')}
        </div>
        <div className="button-group">
          <button
            className="profile-button profile-button-apply"
            onClick={() => {
              this.commitProfileConfiguration();
            }}
          >
            {globalString('performance/profiling/configuration/apply')}
          </button>
          <button
            className="profile-button profile-button-cancel"
            onClick={() => this.props.showProfiling()}
          >
            {globalString('performance/profiling/configuration/cancel')}
          </button>
        </div>
      </div>
    );
  }
}
