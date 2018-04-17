/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-04-06T14:15:28+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-04-16T17:02:17+10:00
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
import SplitPane from 'react-split-pane';
import autobind from 'autobind-decorator';
import { debounce } from 'lodash';
import {
  Classes,
  Button,
  MenuItem,
  Intent,
  Position,
  Tooltip
} from '@blueprintjs/core';
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
    console.log('Selected DB: ', item);
    this.setState({ selectedDatabase: item.name });
  };

  render() {
    const { store, showPerformancePanel } = this.props;
    const { profilingPanel } = store;
    const { selectedDatabase, selectedOperation } = this.state;
    const ops = profilingPanel.payload;
    const { highWaterMarkProfile } = profilingPanel;
    if (!selectedDatabase && profilingPanel.databases[0]) {
      this.state.selectedDatabase = profilingPanel.databases[0].name;
    }

    const splitPane2Style = {
      display: 'flex',
      flexDirection: 'column'
    };

    const renderItem = (item, { handleClick, modifiers }) => {
      console.log(modifiers);
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

    const filterItem = (query, item) => {
      return (
        `${item.name}. ${item.name.toLowerCase()}`.indexOf(
          query.toLowerCase()
        ) >= 0
      );
    };

    const onOperationSelection = selectedOperation => {
      this.setState({ selectedOperation });
    };

    return (
      <div className="profilingView">
        <SplitPane
          className="MainSplitPane"
          split="horizontal"
          defaultSize="40%"
          minSize={200}
          maxSize={1000}
          pane2Style={splitPane2Style}
        >
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
                  items={profilingPanel.databases}
                  itemRenderer={renderItem}
                  itemPredicate={filterItem}
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
              <ProfilingView
                operations={ops}
                highWaterMark={highWaterMarkProfile}
                onSelect={onOperationSelection}
                showPerformancePanel={showPerformancePanel}
                tableWidth={this.state.topSplitPos}
              />
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
        </SplitPane>
      </div>
    );
  }
}
