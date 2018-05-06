/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-04-06T14:15:28+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-04-26T15:46:42+10:00
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
import { Classes, Button, MenuItem, Intent, Position, Tooltip } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';
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
      topSplitPos: window.innerWidth - 61
    };
    this.props.store.api.getProfilingDataBases();
  }
  componentDidMount() {
    window.addEventListener('resize', debounce(this.handleResize, 400));
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }
  @autobind
  handleResize() {
    this.setState({ topSplitPos: window.innerWidth });
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

    this.props.store.api.getProfilingData(item);
  };

  render() {
    const { store, showProfileConfiguration } = this.props;
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
    } else if (ops && ops.length && ops.length > 20) {
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
              {showProfileConfiguration && (
                <Tooltip
                  className="ResetButton pt-tooltip-indicator pt-tooltip-indicator-form"
                  content={globalString('performance/profiling/profile-configuration-button-text')}
                  hoverOpenDelay={1000}
                  inline
                  intent={Intent.PRIMARY}
                  position={Position.BOTTOM}
                >
                  <Button
                    className="top-con-button reset-button pt-button pt-intent-primary"
                    text={globalString('performance/profiling/profile-configuration-button-text')}
                    onClick={showProfileConfiguration}
                  />
                </Tooltip>
              )}
            </div>
          </nav>
          <div className="tableWrapper">
            <div className="dbSelectWrapper">
              <span className="dbSelectLabel">Database</span>
              <Select
                filterable={false}
                items={profilingPanel.enabledDatabases}
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
            </div>

            {renderTable && (
              <ProfilingView
                ops={ops}
                highWaterMark={highWaterMarkProfile}
                onSelect={onOperationSelection}
                tableWidth={this.state.topSplitPos}
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
                <ExplainView execStats={selectedOperation.execStats} />
              )}
          </div>
        )}
      </div>
    );
  }
}
