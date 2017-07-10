/*
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

/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-21T09:24:34+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-10T14:43:51+10:00
 */

import React from 'react';
import { inject, observer, Provider } from 'mobx-react';
import { action, untracked } from 'mobx';
import SplitPane from 'react-split-pane';

import { ProfileListPanel } from '#/ProfileListPanel';
import { TreePanel } from '#/TreePanel';
import TreeState from '#/TreePanel/model/TreeState.js';
import { ConnectionProfilePanel } from '#/ConnectionPanel';
import { TreeActionPanel } from '#/TreeActionPanel';
import { DrawerPanes } from '#/common/Constants';

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

  treeState = new TreeState();
  render() {
    const { layout, drawer } = this.props;
    const drawerChild = drawer.drawerChild;
    let defaultLeftSplitPos;

    untracked(() => {
      defaultLeftSplitPos = layout.leftSplitPos;
    });

    return (
      <div>
        {drawerChild == DrawerPanes.DEFAULT &&
          <SplitPane
            className="LeftSplitPane"
            split="horizontal"
            defaultSize={defaultLeftSplitPos}
            onDragFinished={this.updateLeftSplitPos}
            minSize={100}
            maxSize={1000}
            pane2Style={splitPane2Style}
          >
            <ProfileListPanel />
            <Provider treeState={this.treeState}>
              <TreePanel />
            </Provider>
          </SplitPane>}

        {drawerChild == DrawerPanes.PROFILE &&
          <ConnectionProfilePanel />
        }

        {drawerChild == DrawerPanes.DYNAMIC &&
          <TreeActionPanel />
        }
      </div>
    );
  }
}
