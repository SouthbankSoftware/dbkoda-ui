/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-04-06T14:15:28+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-05-25T13:39:27+10:00
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
import { action } from 'mobx';
import { inject, observer } from 'mobx-react';
import SplitPane from 'react-split-pane';
import autobind from 'autobind-decorator';
import { debounce } from 'lodash';
import ExplainView from '#/ProfilingPanel/Views/ExplainView';
import ConnectionsView from './Views/Connections';
import OperationsView from './Views/Operations';
import OperationDetails from './Views/OperationDetails';

import './Panel.scss';

@inject(allStores => ({
  api: allStores.store.api,
  store: allStores.store
}))
@observer
export default class TopConnectionsPanel extends React.Component<Props> {
  timeoutUpdateId = null;
  constructor(props) {
    super(props);
    this.state = {
      autoRefreshTopCon: false,
      autoRefreshTimeout: 30,
      bottomSplitPos: window.innerWidth * 0.6 < 600 ? 600 : window.innerWidth * 0.6,
      topSplitPos: window.innerWidth - 61
    };
    this.props.api.getTopConnections();
  }
  componentDidMount() {
    window.addEventListener('resize', debounce(this.handleResize, 400));
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  @autobind
  updateTopConnections() {
    if (this.state.autoRefreshTopCon && this.state.autoRefreshTimeout > 0) {
      this.props.api.getTopConnections();
      this.setTimerForUpdate();
    }
  }

  @autobind
  handleResize() {
    this.setState({ topSplitPos: window.innerWidth - 61 });
  }

  @autobind
  updateBottomSplitPos(pos) {
    this.setState({ bottomSplitPos: pos });
  }

  @action.bound
  onConnectionSelection(selectedConnection) {
    this.props.store.topConnectionsPanel.selectedConnection = selectedConnection;
    this.props.store.topConnectionsPanel.operations = selectedConnection.ops;
    this.props.store.topConnectionsPanel.bShowExplain = false;
    this.props.store.topConnectionsPanel.selectedOperation = null;
  }

  @action.bound
  onOperationSelection(selectedOperation) {
    this.props.store.topConnectionsPanel.selectedOperation = selectedOperation;
    if (
      selectedOperation &&
      selectedOperation.explainPlan &&
      selectedOperation.explainPlan.queryPlanner &&
      selectedOperation.explainPlan.queryPlanner.winningPlan
    ) {
      this.props.store.topConnectionsPanel.bShowExplain = true;
    } else {
      this.props.store.topConnectionsPanel.bShowExplain = false;
      this.props.store.topConnectionsPanel.bLoadingExplain = false;
    }
  }

  @autobind
  setTimerForUpdate(timerValue = 0) {
    const autoRefreshTimeout = timerValue > 0 ? timerValue : this.state.autoRefreshTimeout;
    if (this.timeoutUpdateId) {
      clearTimeout(this.timeoutUpdateId);
      this.timeoutUpdateId = null;
    }
    this.timeoutUpdateId = setTimeout(this.updateTopConnections, autoRefreshTimeout * 1000);
  }

  @autobind
  onAutoRefreshCheckboxToggle(e) {
    const fieldValue = e.target.checked === true;
    const fieldName = e.target.id;
    l.info(fieldName, ':', fieldValue);
    this.setState({ autoRefreshTopCon: fieldValue });
    if (fieldValue && this.state.autoRefreshTimeout > 0) {
      this.setTimerForUpdate();
    }
    if (!fieldValue && this.timeoutUpdateId) {
      clearTimeout(this.timeoutUpdateId);
      this.timeoutUpdateId = null;
    }
    // this.props.updateValue(fieldName, fieldValue);
  }

  @autobind
  onAutoRefreshTimeoutChange(value) {
    l.info('onAutoRefreshTimeoutChange:', value);
    if (value < 5) {
      value = 5;
    }
    this.setState({ autoRefreshTimeout: value });
    if (value > 0 && this.state.autoRefreshTopCon) {
      this.setTimerForUpdate(value);
    }
  }

  render() {
    const splitPane2Style = {
      display: 'flex',
      flexDirection: 'column'
    };
    const bottomPane2Style = {
      width: this.state.topSplitPos - this.state.bottomSplitPos + 'px'
    };
    const { topConnectionsPanel } = this.props.store;
    const { selectedOperation } = topConnectionsPanel;
    let defaultOperationPaneSize = '100%';
    if (topConnectionsPanel.bShowExplain) {
      defaultOperationPaneSize = '50%';
    }

    return (
      <div className="topConnectionsPanel">
        <SplitPane
          className="MainSplitPane"
          split="horizontal"
          defaultSize="35%"
          minSize={200}
          maxSize={1000}
          pane2Style={splitPane2Style}
        >
          <div className="connectionList">
            <ConnectionsView
              onSelect={this.onConnectionSelection}
              tableWidth={this.state.topSplitPos}
              onAutoRefreshCheckboxToggle={this.onAutoRefreshCheckboxToggle}
              autoRefreshTimeout={this.state.autoRefreshTimeout}
              onAutoRefreshTimeoutChange={this.onAutoRefreshTimeoutChange}
            />
          </div>
          <SplitPane
            className="DetailsSplitPane"
            split="horizontal"
            defaultSize={defaultOperationPaneSize}
            size={defaultOperationPaneSize}
            minSize={200}
            maxSize={1000}
            pane2Style={splitPane2Style}
          >
            <SplitPane
              className="BottomSplitPane"
              split="vertical"
              defaultSize={this.state.bottomSplitPos}
              onDragFinished={this.updateBottomSplitPos}
              minSize={600}
              maxSize={1200}
              pane2Style={bottomPane2Style}
            >
              <div className="operationList">
                <OperationsView
                  onSelect={this.onOperationSelection}
                  tableWidth={this.state.bottomSplitPos}
                />
              </div>
              <div className="operationDetails">
                <OperationDetails />
              </div>
            </SplitPane>
            <div style={{ overflow: 'auto' }}>
              {topConnectionsPanel.bShowExplain &&
                selectedOperation &&
                selectedOperation.explainPlan &&
                selectedOperation.explainPlan.queryPlanner &&
                selectedOperation.explainPlan.queryPlanner.winningPlan && (
                  <ExplainView
                    execStats={selectedOperation.explainPlan.queryPlanner.winningPlan}
                    operation={selectedOperation}
                  />
                )}
            </div>
          </SplitPane>
        </SplitPane>
      </div>
    );
  }
}
