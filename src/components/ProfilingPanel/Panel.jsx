/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-04-06T14:15:28+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-05-25T13:36:15+10:00
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
import { inject, observer } from 'mobx-react';
import { runInAction } from 'mobx';
import autobind from 'autobind-decorator';
import ErrorView from '#/common/ErrorView';
import { debounce } from 'lodash';
import {
  Classes,
  Button,
  AnchorButton,
  MenuItem,
  Intent,
  Position,
  Tooltip,
  Switch,
  RadioGroup,
  Radio,
  NumericInput
} from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';
import RefreshIcon from '~/styles/icons/refresh-icon.svg';
import ProfilingView from './Views/ProfilingView';
import ExplainView from './Views/ExplainView';
import OperationDetails from './Views/OperationDetails';

import './Panel.scss';

@inject(allStores => ({
  api: allStores.store.api,
  store: allStores.store
}))
@observer
export default class ProfilingPanel extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      selectedDatabase: null,
      databaseList: [],
      selectedOperation: null,
      bottomSplitPos: 1000,
      topSplitPos: window.innerWidth - 61 - Math.round(window.innerWidth * 0.05),
      currentConfig: {},
      dirtyConfig: false
    };
    this.defaultOptions = {
      selectedDb: { value: { was: 0 } },
      selectedValue: 0,
      exceedLimit: 100,
      profileCollectionSize: 1000000
    };
    this.state.currentConfig = this.defaultOptions;
    this.refreshDB = this.props.store.api.getProfilingDataBases;
    this.refreshDB();
  }
  componentDidMount() {
    window.addEventListener('resize', debounce(this.handleResize, 400));
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }
  @autobind
  handleResize() {
    this.setState({ topSplitPos: window.innerWidth - 61 - Math.round(window.innerWidth * 0.05) });
  }
  @autobind
  updateBottomSplitPos(pos) {
    this.setState({ bottomSplitPos: pos });
  }

  _onDBSelect = item => {
    this.setState({ selectedDatabase: item.name });
    this.setState({ selectedOperation: null }); // Reset selected operation to null.
    runInAction('Reset profiling payload to null before re-fetching.', () => {
      this.props.store.profilingPanel.payload = null;
    });

    // Get configuration information for state:
    const dbConfig = {};
    dbConfig.selectedValue = item.value.was; // Profiling type: 0 = off.
    dbConfig.exceedLimit = item.value.slowms; // Profiling type: 0 = off.
    dbConfig.profileCollectionSize = item.value.size || 0; // Profiling type: 0 = off.
    this.state.dirtyConfig = false;
    this.setState({ currentConfig: dbConfig });
    this.props.store.api.getProfilingData(item);
  };

  @autobind
  _onRefreshDBs() {
    this.setState({ selectedDatabase: null });
    this.refreshDB();
  }

  @autobind
  _onRefreshOps() {
    this.setState({ selectedOperation: null });
    this.props.store.api.getProfilingData({ name: this.state.selectedDatabase });
  }

  @autobind
  _onChangeProfilingStatus() {
    // If turning on profiling, send through currentConfig to start profiling:
    if (this.state.currentConfig.selectedValue > 0) {
      const config = {
        level: 0,
        slowms: this.state.currentConfig.exceedLimit,
        profileSize: this.state.currentConfig.profileCollectionSize,
        dbName: this.state.selectedDatabase
      };
      this.state.currentConfig.selectedValue = 0;
      l.info('change profile configuration ', config);
    } else {
      const config = {
        level: 1,
        slowms: this.state.currentConfig.exceedLimit,
        profileSize: this.state.currentConfig.profileCollectionSize,
        dbName: this.state.selectedDatabase
      };
      this.state.currentConfig.selectedValue = 1;
      l.info('change profile configuration ', config);
    }
    this.setState({ dirtyConfig: false });
  }

  @autobind
  _onClickApply() {
    // Set profiling config for existing database:
    const config = {
      level: this.state.currentConfig.selectedValue,
      slowms: this.state.currentConfig.exceedLimit,
      profileSize: this.state.currentConfig.profileCollectionSize,
      dbName: this.state.selectedDatabase
    };
    l.info('change profile configuration ', config);
    if (config) {
      this.props.api.setProfilingDatabaseConfiguration([config]);
    }
    this.setState({ dirtyConfig: false });
  }

  @autobind
  _onModeChange(event) {
    l.debug('Mode changed to: ', event.currentTarget.value);
    // Making modification to a profiling db means config is dirty.
    if (this.state.currentConfig.selectedValue > 0) {
      this.state.dirtyConfig = true;
    }
    const newConfig = this.state.currentConfig;
    newConfig.selectedValue = parseInt(event.currentTarget.value, 10);
    this.setState({ currentConfig: newConfig });
  }

  @autobind
  _onUpdateSizeLimit(value) {
    l.debug('Size limit changed to ', value);
    // Making modification to a profiling db means config is dirty.
    if (this.state.currentConfig.selectedValue > 0) {
      this.state.dirtyConfig = true;
    }
    const newConfig = this.state.currentConfig;
    newConfig.profileCollectionSize = value;
    this.setState({ currentConfig: newConfig });
  }

  @autobind
  _onUpdateExceedLimit(value) {
    l.debug('Exceeding value changed to ', value);
    // Making modification to a profiling db means config is dirty.
    if (this.state.currentConfig.selectedValue > 0) {
      this.state.dirtyConfig = true;
    }
    const newConfig = this.state.currentConfig;
    newConfig.exceedLimit = value;
    this.setState({ currentConfig: newConfig });
  }

  render() {
    const { store } = this.props;
    const { profilingPanel } = store;
    const { selectedDatabase, selectedOperation } = this.state;
    let ops = this.props.store.profilingPanel.payload;
    const { highWaterMarkProfile } = profilingPanel;
    let renderTable = true;
    let errorTitle = globalString('performance/profiling/results/noResultsFoundTitle');
    let errorBody = globalString('performance/profiling/results/noResultsFoundTitle');
    if (!selectedDatabase) {
      errorTitle = globalString('performance/profiling/results/noDatabaseSelectedTitle');
      errorBody = globalString('performance/profiling/results/noDatabaseSelectedBody');
    }
    if (!selectedDatabase) {
      renderTable = false;
    } else if (ops && ops.length && ops.length > 30) {
      ops = ops.slice(0, 30);
    }

    const renderItem = (item, { handleClick, modifiers }) => {
      return (
        <MenuItem
          className={modifiers.active ? Classes.ACTIVE : ''}
          key={item.name}
          label={item.name}
          onClick={handleClick}
          text={item.name}
        />
      );
    };

    const onOperationSelection = selectedOperation => {
      l.debug(selectedOperation);
      this.setState({ selectedOperation: null });
      this.setState({ selectedOperation });
    };

    return (
      <div className="profilingView">
        <div className="profilingResultsWrapper">
          <nav className=" pt-navbar panelHeader">
            <div className="pt-navbar-group pt-align-left">
              <div className="pt-navbar-heading viewHeading">Profiling Results</div>
            </div>
            <div className="pt-navbar-group pt-align-right">
              <Tooltip
                className="btnTooltip pt-tooltip-indicator pt-tooltip-indicator-form"
                content={globalString('performance/profiling/refreshOps')}
                hoverOpenDelay={1000}
                inline
                intent={Intent.PRIMARY}
                position={Position.BOTTOM}
              >
                <AnchorButton
                  className="refreshButton"
                  onClick={this._onRefreshOps}
                  disabled={this.selectedDatabase}
                >
                  <RefreshIcon width={50} height={50} className="dbKodaSVG" />
                </AnchorButton>
              </Tooltip>
            </div>
          </nav>
          <div className="tableWrapper">
            <div className="dbSelectWrapper">
              <span className="dbSelectLabel">
                {globalString('performance/profiling/results/database')}
              </span>
              <Select
                filterable={false}
                items={profilingPanel.databases}
                itemRenderer={renderItem}
                noResults={<MenuItem disabled text="No Results" />}
                onItemSelect={this._onDBSelect}
              >
                <Button
                  className="select-button"
                  text={this.state.selectedDatabase || 'Select DB'}
                  rightIcon="double-caret-vertical"
                />
              </Select>
              <span className="profilingSwitchLabel">
                {globalString('performance/profiling/results/profiling')}
              </span>
              <Switch
                className="profilingStatus"
                checked={this.state.currentConfig.selectedValue}
                onChange={this._onChangeProfilingStatus}
                disabled={!this.state.selectedDatabase}
              />

              <RadioGroup
                label={globalString('performance/profiling/results/mode')}
                className="radioGroup"
                onChange={this._onModeChange}
                selectedValue={this.state.currentConfig.selectedValue}
                disabled={!this.state.selectedDatabase}
              >
                <span> {globalString('performance/profiling/results/all')}</span>
                <Radio disabled={!this.state.selectedDatabase} value={2} />
                <span> {globalString('performance/profiling/results/exceeding')}</span>
                <Radio disabled={!this.state.selectedDatabase} value={1} />
              </RadioGroup>
              <NumericInput
                value={this.state.currentConfig.exceedLimit}
                stepSize={10}
                majorStepSize={100}
                selectAllOnFocus
                min={1}
                disabled={
                  !this.state.selectedDatabase || this.state.currentConfig.selectedValue != 2
                }
                onValueChange={this._onUpdateExceedLimit}
              />
              <span>{globalString('performance/profiling/results/collectionSize')}</span>
              <NumericInput
                className="size-limit"
                stepSize={1000}
                majorStepSize={1000000}
                min={1000}
                onValueChange={this._onUpdateSizeLimit}
                value={this.state.currentConfig.profileCollectionSize}
                disabled={!this.state.selectedDatabase}
              />
              <Tooltip
                className="btnTooltip pt-tooltip-indicator pt-tooltip-indicator-form"
                content={globalString('performance/profiling/apply')}
                hoverOpenDelay={1000}
                inline
                intent={Intent.PRIMARY}
                position={Position.BOTTOM}
              >
                <Button
                  disabled={!this.state.selectedDatabase}
                  className="applybutton reset-button pt-button pt-intent-primary"
                  text="Apply"
                  onClick={this._onClickApply}
                />
              </Tooltip>
              {this.state.dirtyConfig && (
                <span>{globalString('performance/profiling/results/unsavedChanges')}</span>
              )}
            </div>

            {renderTable && (
              <ProfilingView
                ops={ops}
                highWaterMark={highWaterMarkProfile}
                onSelect={onOperationSelection}
                tableWidth={this.state.topSplitPos}
                refreshOps={this._onRefreshOps}
              />
            )}
            {!selectedDatabase &&
              !renderTable && <ErrorView title={errorTitle} error={errorBody} />}
          </div>
        </div>
        {renderTable && (
          <div className="detailsWrapper">
            <div className="exampleWrapper">
              <OperationDetails operation={selectedOperation} />
            </div>
            {selectedOperation &&
              selectedOperation.execStats && (
                <ExplainView
                  execStats={selectedOperation.execStats}
                  operation={selectedOperation}
                />
              )}
          </div>
        )}
      </div>
    );
  }
}
