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
import ConnectionsView from './Views/Connections';
import OperationsView from './Views/Operations';
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
      selectedConnection: null,
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
  render() {
    const { store, showPerformancePanel } = this.props;
    const { topConnectionsPanel } = store;
    const connections = topConnectionsPanel.payload;
    const highWaterMarkCon = topConnectionsPanel.highWaterMarkConnection;
    const { selectedConnection, selectedOperation } = this.state;
    let operations = null;
    if (selectedConnection && selectedConnection.ops) {
      operations = selectedConnection.ops;
    }

    const splitPane2Style = {
      display: 'flex',
      flexDirection: 'column'
    };
    const onConnectionSelection = selectedConnection => {
      this.setState({ selectedConnection });
    };

    const onOperationSelection = selectedOperation => {
      this.setState({ selectedOperation });
    };
    return (
      <div>
        <SplitPane
          className="MainSplitPane"
          split="horizontal"
          defaultSize="60%"
          minSize={200}
          maxSize={1000}
          pane2Style={splitPane2Style}
        >
          <div className="connectionList">
            <ConnectionsView
              connections={connections}
              highWaterMark={highWaterMarkCon}
              onSelect={onConnectionSelection}
              showPerformancePanel={showPerformancePanel}
              tableWidth={this.state.topSplitPos}
            />
          </div>
          <SplitPane
            className="BottomSplitPane"
            split="vertical"
            defaultSize={this.state.bottomSplitPos}
            onDragFinished={this.updateBottomSplitPos}
            minSize={700}
            maxSize={1200}
          >
            <div className="operationList">
              <OperationsView
                operations={operations}
                onSelect={onOperationSelection}
                tableWidth={this.state.bottomSplitPos}
              />
            </div>
            <div className="operationDetails">
              <OperationDetails operation={selectedOperation} />
            </div>
          </SplitPane>
        </SplitPane>
      </div>
    );
  }
}
