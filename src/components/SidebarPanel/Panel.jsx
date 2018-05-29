/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-21T09:24:34+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-29T18:16:32+10:00
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
import { inject, observer, Provider } from 'mobx-react';
import { action, untracked } from 'mobx';
import EnhancedSplitPane from '#/common/EnhancedSplitPane';
import { Button } from '@blueprintjs/core';
import { ProfileListPanel } from '#/ProfileListPanel';
import { TreePanel } from '#/TreePanel';
import TreeState from '#/TreePanel/model/TreeState.js';
import { AggregateLeftPanel } from '#/AggregateViews';
import { TreeActionPanel } from '#/TreeActionPanel';
import { DrawerPanes } from '#/common/Constants';
import { BackupRestore } from '../BackupRestore/index';

import './Panel.scss';

const splitPane2Style = {
  display: 'flex',
  flexDirection: 'column'
};

@inject(allStores => ({
  store: allStores.store,
  layout: allStores.store.layout,
  drawer: allStores.store.drawer
}))
@observer
export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  @action.bound
  updateLeftSplitPos(pos) {
    this.props.layout.leftSplitPos = pos;
  }

  @action.bound
  updateLeftSplitResizerState(state) {
    this.props.layout.leftSplitResizerState = state;
  }

  @action.bound
  updateAndRestart() {
    this.props.store.updateAndRestart();
  }

  treeState = new TreeState(this.props.store);
  render() {
    const { layout, drawer } = this.props;
    let leftSplitPos;
    let leftSplitResizerState;

    untracked(() => {
      ({ leftSplitPos, leftSplitResizerState } = layout);
    });

    return (
      <div>
        <div className="leftPaneInnerWrapper">
          {drawer.drawerChild == DrawerPanes.DEFAULT && (
            <EnhancedSplitPane
              className="LeftSplitPane"
              split="horizontal"
              size={leftSplitPos}
              onDragFinished={this.updateLeftSplitPos}
              resizerState={leftSplitResizerState}
              onResizerStateChanged={this.updateLeftSplitResizerState}
              minSize={100}
              maxSize={1000}
              pane2Style={splitPane2Style}
            >
              <ProfileListPanel />
              <Provider treeState={this.treeState}>
                <TreePanel />
              </Provider>
            </EnhancedSplitPane>
          )}

          {drawer.drawerChild == DrawerPanes.DYNAMIC && <TreeActionPanel />}

          {drawer.drawerChild == DrawerPanes.AGGREGATE && (
            <AggregateLeftPanel className="sidebarAggregate" />
          )}

          {drawer.drawerChild == DrawerPanes.BACKUP_RESTORE && <BackupRestore />}
        </div>
        {this.props.store.updateAvailable && (
          <div className="leftPaneUpdateNotification">
            <Button
              className="updateButton pt-button pt-intent-primary"
              text="Update Downloaded. Click here to update and restart."
              onClick={this.updateAndRestart}
            />
          </div>
        )}
      </div>
    );
  }
}
