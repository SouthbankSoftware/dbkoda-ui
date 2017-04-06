/**
 * @Author: guiguan
 * @Date:   2017-03-07T13:47:00+11:00
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-06T17:25:11+10:00
 */

import React from 'react';
import {Alert, Intent} from '@blueprintjs/core';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import SplitPane from 'react-split-pane';
import Drawer from 'react-motion-drawer';
import {action, untracked} from 'mobx';
import {inject, observer, PropTypes} from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import {EditorPanel} from '#/EditorPanel';
import {OutputPanel} from '#/OutputPanel';
import {ProfileListPanel} from '#/ProfileListPanel';
import {TreePanel} from '#/TreePanel';
import {TreeActionPanel} from '#/TreeActionPanel';
import {ConnectionProfilePanel} from '../components/ConnectionPanel';
import EventReaction from '#/common/logging/EventReaction.jsx';
import {DrawerPanes} from '#/common/Constants';

import 'normalize.css/normalize.css';
import '@blueprintjs/core/dist/blueprint.css';
import '@blueprintjs/table/dist/table.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/ambiance.css';
import '~/styles/global.scss';

import './App.scss';

const splitPane2Style = {
  display: 'flex',
  flexDirection: 'column'
};

@inject(allStores => ({store: allStores.store, layout: allStores.store.layout, drawer: allStores.store.drawer}))
@observer
class App extends React.Component {
  static propTypes = {
    layout: PropTypes.observableObject.isRequired
  };

  @action.bound
  closeOptIn(bool) {
    this.props.store.userPreferences.telemetryEnabled = bool;
    this.props.store.layout.optInVisible = false;
  }

  @action.bound
  updateDrawerOpenStatus(open) {
    this.props.drawer.drawerOpen = open;
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

  @action.bound
  getDrawerChild() {
    if (this && this.props.drawer.drawerChild == DrawerPanes.PROFILE) {
      return <ConnectionProfilePanel />;
    } else if (this && this.props.drawer.drawerChild == DrawerPanes.DYNAMIC) {
      return <TreeActionPanel />;
    }
    return null;
  }

  render() {
    const {layout, drawer} = this.props;
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
        <Alert
          className="pt-dark optInAlert"
          isOpen={this.props.layout.optInVisible}
          intent={Intent.PRIMARY}
          iconName="pt-icon-chart"
          confirmButtonText="Sure!"
          onConfirm={() => this.closeOptIn(true)}
          cancelButtonText="No Thanks."
          onCancel={() => this.closeOptIn(false)}>
          <h2>Hey!</h2>
          <p>
            We would like to gather information about how you are using the product so we
            can make it even more <b className="optInBoldDBEnvy">awesome</b>.
          </p>
          <p>
            Is it okay if we collect some information about how you interact
            with <b className="optInBoldDBEnvy"> DBEnvy </b> and send it back to our servers?
          </p>
        </Alert>
        <Drawer
          className="drawer"
          open={drawer.drawerOpen}
          width="40%"
          handleWidth={0}
          noTouchOpen
          noTouchClose
          drawerStyle={{
          'minWidth': 512
        }}
          onChange={this.updateDrawerOpenStatus}>
          {this.getDrawerChild}
        </Drawer>
        <SplitPane
          split="vertical"
          defaultSize={defaultOverallSplitPos}
          onDragFinished={this.updateOverallSplitPos}
          minSize={350}
          maxSize={750}>
          <SplitPane
            split="horizontal"
            defaultSize={defaultLeftSplitPos}
            onDragFinished={this.updateLeftSplitPos}
            minSize={100}
            maxSize={1000}
            pane2Style={splitPane2Style}>
            <ProfileListPanel openDrawer={this.updateDrawerOpenStatus} />
            <TreePanel />
          </SplitPane>
          <SplitPane
            split="horizontal"
            defaultSize={defaultRightSplitPos}
            onDragFinished={this.updateRightSplitPos}
            minSize={200}
            maxSize={1000}
            pane2Style={splitPane2Style}>
            <EditorPanel />
            <OutputPanel />
          </SplitPane>
        </SplitPane>
        <EventReaction />
        <DevTools />
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(App);
