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
 * @Author: guiguan
 * @Date:   2017-03-07T13:47:00+11:00
 * @Last modified by:   chris
 * @Last modified time: 2017-06-20T17:33:54+10:00
 */

import React from 'react';
import { Alert, Intent } from '@blueprintjs/core';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import SplitPane from 'react-split-pane';
import { action, untracked } from 'mobx';
import { inject, observer, PropTypes } from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import { EditorPanel } from '#/EditorPanel';
import { OutputPanel } from '#/OutputPanel';
import { SidebarPanel } from '#/SidebarPanel';
import { Analytics } from '#/Analytics';
import EventReaction from '#/common/logging/EventReaction.jsx';

import 'normalize.css/normalize.css';
import '@blueprintjs/core/dist/blueprint.css';
import '@blueprintjs/table/dist/table.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/ambiance.css';
import '~/styles/global.scss';

import './App.scss';

@inject(allStores => ({
  store: allStores.store,
  layout: allStores.store.layout
}))
@observer
class App extends React.Component {
  static propTypes = {
    layout: PropTypes.observableObject.isRequired
  };

  componentDidMount() {
    window.addEventListener('beforeunload', () => {
      this.props.store.save();
    });
  }

  @action.bound
  updateRightSplitPos(pos) {
    this.props.layout.rightSplitPos = pos;
  }

  @action.bound
  updateOverallSplitPos(pos) {
    this.props.layout.overallSplitPos = pos;
  }

  @action.bound
  closeOptIn(bool) {
    this.props.store.userPreferences.telemetryEnabled = bool;
    this.props.store.layout.optInVisible = false;
  }

  render() {
    const { layout } = this.props;
    const splitPane2Style = {
      display: 'flex',
      flexDirection: 'column'
    };
    let defaultOverallSplitPos;
    let defaultRightSplitPos;

    untracked(() => {
      defaultOverallSplitPos = layout.overallSplitPos;
      defaultRightSplitPos = layout.rightSplitPos;
    });
    return (
      <div>
        <Analytics />
        <Alert
          className="pt-dark optInAlert"
          isOpen={this.props.layout.optInVisible}
          intent={Intent.PRIMARY}
          iconName="pt-icon-chart"
          confirmButtonText="Sure!"
          onConfirm={() => this.closeOptIn(true)}
          cancelButtonText="No Thanks."
          onCancel={() => this.closeOptIn(false)}
        >
          <h2>Hey!</h2>
          <p>
            We would like to gather information about how you are using the
            product so we
            can make it even more <b className="optInBoldDBKoda">awesome</b>.
          </p>
          <p>
            Is it okay if we collect some information about how you interact
            with
            {' '}
            <b className="optInBoldDBKoda"> dbKoda </b>
            {' '}
            and send it back to our servers?
          </p>
        </Alert>
        <SplitPane
          className="RootSplitPane"
          split="vertical"
          defaultSize={defaultOverallSplitPos}
          onDragFinished={this.updateOverallSplitPos}
          minSize={400}
          maxSize={750}
        >
          <SidebarPanel />
          <SplitPane
            className="RightSplitPane"
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
        <EventReaction />
        {process.env.NODE_ENV !== 'production'
          ? <div className="DevTools">
            <DevTools position={{ right: -1000, top: 200 }} />
          </div>
          : null}
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(App);
