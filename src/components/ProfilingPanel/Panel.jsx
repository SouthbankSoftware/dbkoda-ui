/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-04-06T14:15:28+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-04-24T14:26:08+10:00
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
import { ProfilingConstants } from '#/common/Constants';
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
  constructor() {
    super();
    this.state = {
      selectedDatabase: null,
      databaseList: [],
      selectedOperation: null,
      bottomSplitPos: 1000,
      topSplitPos: window.innerWidth
    };
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
    const { store, showPerformancePanel } = this.props;
    const { profilingPanel } = store;
    const { selectedDatabase, selectedOperation } = this.state;
    const ops = this.props.store.profilingPanel.payload;
    const { highWaterMarkProfile } = profilingPanel;
    let renderTable = true;
    if (
      !selectedDatabase &&
      profilingPanel.enabledDatabases &&
      profilingPanel.enabledDatabases[0]
    ) {
      this.state.selectedDatabase = profilingPanel.enabledDatabases[0].name;
    }
    if (ops === ProfilingConstants.NO_RESULTS) {
      renderTable = false;
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
      this.setState({ selectedOperation });
    };

    return (
      <div className="profilingView">
        <div className="profilingResultsWrapper">
          <nav className=" pt-navbar panelHeader">
            <div className="pt-navbar-group pt-align-left">
              <div className="pt-navbar-heading">Profiling Results</div>
            </div>
            <div className="pt-navbar-group pt-align-right">
              <Tooltip
                className="ResetButton pt-tooltip-indicator pt-tooltip-indicator-form"
                content="Show Performance Panel"
                hoverOpenDelay={1000}
                inline
                intent={Intent.PRIMARY}
                position={Position.BOTTOM}
              >
                <Button
                  className="reset-button pt-button pt-intent-primary"
                  text="Performance"
                  onClick={showPerformancePanel}
                />
              </Tooltip>
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
                  text={this.state.selectedDatabase || 'Select Database'}
                  rightIcon="double-caret-vertical"
                />
              </Select>
            </div>

            {renderTable ? (
              <ProfilingView
                ops={ops}
                highWaterMark={highWaterMarkProfile}
                onSelect={onOperationSelection}
                showPerformancePanel={showPerformancePanel}
                tableWidth={this.state.topSplitPos}
              />
            ) : (
              <ErrorView
                title={globalString('performance/profiling/results/noResultsFoundTitle')}
                error={globalString('performance/profiling/results/noResultsFoundBody')}
              />
            )}
          </div>
        </div>
        <div className="detailsWrapper">
          <div className="operationDetails">
            <OperationDetails operation={selectedOperation} />
          </div>
          <div className="explainView">
            <ExplainView operation={selectedOperation} />
          </div>
        </div>
      </div>
    );
  }
}
