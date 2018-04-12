/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-04-06T14:15:28+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-04-12T16:42:23+10:00
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
  constructor() {
    super();
    this.state = {
      selectedConnection: null,
      selectedOperation: null
    };
  }
  render() {
    const { store } = this.props;
    const { topConnectionsPanel } = store;
    const connections = topConnectionsPanel.payload;
    const { selectedConnection, selectedOperation } = this.state;
    let operations = null;
    if (selectedConnection && selectedConnection.ops) {
      operations = selectedConnection.ops;
    }

    const splitPane2Style = {
      display: 'flex',
      flexDirection: 'column'
    };
    const onConnectionSelection = (selectedConnection) => {
      console.log('selectedConnection:', selectedConnection);
      this.setState({selectedConnection});
    };

    const onOperationSelection = (selectedOperation) => {
      this.setState({selectedOperation});
    };
    return (
      <div>
        <SplitPane
          className="RightSplitPane"
          split="horizontal"
          defaultSize="60%"
          minSize={200}
          maxSize={1000}
          pane2Style={splitPane2Style}
        >
          <div className="connectionList">
            <ConnectionsView connections={connections} onSelect={onConnectionSelection} />
          </div>
          <SplitPane
            className="RootSplitPane"
            split="vertical"
            defaultSize="60%"
            onDragFinished={this.updateOverallSplitPos}
            minSize={700}
            maxSize={1200}
          >
            <div className="operationList"><OperationsView operations={operations} onSelect={onOperationSelection} /></div>
            <div className="operationDetails"><OperationDetails operation={selectedOperation} /></div>
          </SplitPane>
        </SplitPane>
      </div>
    );
  }
}
