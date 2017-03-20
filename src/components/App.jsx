/**
 * @Author: guiguan
 * @Date:   2017-03-07T13:47:00+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-03-16T17:05:45+11:00
 */

import React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import SplitPane from 'react-split-pane';
import Drawer from 'react-motion-drawer';
import { action, untracked } from 'mobx';
import { inject, observer, PropTypes } from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import { EditorPanel } from '#/EditorPanel';
import { OutputPanel } from '#/OutputPanel';
import { ProfileListPanel } from '#/ProfileListPanel';
import { TreePanel } from '#/TreePanel';

import 'normalize.css/normalize.css';
import '@blueprintjs/core/dist/blueprint.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/ambiance.css';
import '~/styles/global.scss';
import {ConnectionProfilePanel} from '../components/ConnectionPanel';

import './App.scss';

const splitPane2Style = {
  display: 'flex',
  flexDirection: 'column'
};

@inject(allStores => ({ layout: allStores.store.layout }))
@observer
class App extends React.Component {
  static propTypes = {
    layout: PropTypes.observableObject.isRequired,
  };

  @action.bound
  updateDrawerOpenStatus(open) {
    this.props.layout.drawerOpen = open;
  }

  @action.bound
  updateOverallSplitPos(pos) {
    this.props.layout.overallSplitPos = pos;
  }

  @action.bound
  updateLeftSplitPos(pos) {
    this.props.layout.leftSplitPos = pos;
  }

  @action.bound
  updateRightSplitPos(pos) {
    this.props.layout.rightSplitPos = pos;
  }

  render() {
    const { layout } = this.props;
    let defaultOverallSplitPos;
    let defaultLeftSplitPos;
    let defaultRightSplitPos;

    untracked(() => {
      defaultOverallSplitPos = layout.overallSplitPos;
      defaultLeftSplitPos = layout.leftSplitPos;
      defaultRightSplitPos = layout.rightSplitPos;
    });

    return (
      <div>
        <Drawer
          className="drawer"
          open={layout.drawerOpen}
          width="36%"
          handleWidth={0}
          onChange={this.updateDrawerOpenStatus}
        >

          <ConnectionProfilePanel/>
        </Drawer>
        <SplitPane
          split="vertical"
          defaultSize={defaultOverallSplitPos}
          onDragFinished={this.updateOverallSplitPos}
          minSize={350}
          maxSize={750}
        >
          <SplitPane
            split="horizontal"
            defaultSize={defaultLeftSplitPos}
            onDragFinished={this.updateLeftSplitPos}
            minSize={100}
            maxSize={1000}
            pane2Style={splitPane2Style}
          >
            <ProfileListPanel openDrawer={this.updateDrawerOpenStatus} />
            <TreePanel />
          </SplitPane>
          <SplitPane
            split="horizontal"
            defaultSize={defaultRightSplitPos}
            onDragFinished={this.updateRightSplitPos}
            minSize={200}
            maxSize={1000}
            pane2Style={splitPane2Style}
          >
            <EditorPanel />
            <OutputPanel />
          </SplitPane>
        </SplitPane>
        <DevTools />
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(App);
