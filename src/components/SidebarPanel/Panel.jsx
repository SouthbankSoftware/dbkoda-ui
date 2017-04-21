/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-21T09:24:34+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-21T09:54:11+10:00
 */

import React from 'react';
import { inject, observer } from 'mobx-react';
import { untracked } from 'mobx';
import SplitPane from 'react-split-pane';

import { ProfileListPanel } from '#/ProfileListPanel';
import { TreePanel } from '#/TreePanel';
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

  render() {
    const { layout, drawer } = this.props;
    const drawerChild = drawer.drawerChild;
    let defaultLeftSplitPos;

    untracked(() => {
      defaultLeftSplitPos = layout.leftSplitPos;
    });

    return (
      <div className="pt-dark">
        {drawerChild == DrawerPanes.DEFAULT &&
          <SplitPane
            split="horizontal"
            defaultSize={defaultLeftSplitPos}
            onDragFinished={this.updateLeftSplitPos}
            minSize={100}
            maxSize={1000}
            pane2Style={splitPane2Style}
          >
            <ProfileListPanel />
            <TreePanel />
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
