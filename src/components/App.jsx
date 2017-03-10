/**
 * @Author: guiguan
 * @Date:   2017-03-07T13:47:00+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-03-11T00:35:49+11:00
 */

import React from 'react';
import SplitPane from 'react-split-pane';
import Drawer from 'react-motion-drawer';
import { Button } from '@blueprintjs/core';
import { action, untracked } from 'mobx';
import { inject, observer, PropTypes } from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import { EditorPanel } from '#/EditorPanel/index.js';
import { OutputPanel } from '#/OutputPanel';
import TreePanel from '#/tree';

import 'normalize.css/normalize.css';
import '@blueprintjs/core/dist/blueprint.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/ambiance.css';
import '~/styles/global.scss';

import './App.scss';

const splitPane2Style = {
  display: 'flex',
  flexDirection: 'column'
};

@inject(allStores => ({ layout: allStores.store.layout }))
@observer
export default class App extends React.Component {
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
          <div className="drawerPanel">
            <h3>Please close me!!!</h3>
          </div>
        </Drawer>
        <SplitPane
          split="vertical"
          defaultSize={defaultOverallSplitPos}
          onDragFinished={this.updateOverallSplitPos}
          minSize={100}
          maxSize={600}
        >
          <SplitPane
            split="horizontal"
            defaultSize={defaultLeftSplitPos}
            onDragFinished={this.updateLeftSplitPos}
            minSize={100}
            maxSize={1000}
            pane2Style={splitPane2Style}
          >
            <div>
              <Button
                className="pt-intent-primary"
                iconName="pt-icon-menu-closed"
                onClick={() => {
                  this.updateDrawerOpenStatus(true);
                }}
              />
            </div>
            <div><TreePanel /></div>
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
