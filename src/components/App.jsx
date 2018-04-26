/**
 * @Author: guiguan
 * @Date:   2017-03-07T13:47:00+11:00
 * @Last modified by:   wahaj
 * @Last modified time: 2018-04-26T13:16:53+10:00
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
import { Broker, EventType } from '~/helpers/broker';
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
import { StatusPanel } from '#/StatusBar';
import { PerformancePanel } from '#/PerformancePanel';
import { ProfileManager } from '#/ProfileManager';
import { SideNav } from '#/SideNav';
import { NavPanes } from '#/common/Constants';
import PasswordDialog from '#/common/PasswordDialog';
import NewFeaturesDialog from '#/common/NewFeaturesDialog';
import PasswordResetDialog from '#/common/PasswordResetDialog';
import { performancePanelStatuses } from '~/api/PerformancePanel';

import 'normalize.css/normalize.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/table/lib/css/table.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/ambiance.css';
import '~/styles/global.scss';
import '~/styles/fonts/index.css';
import TelemetryConsent from './TelemetryConsent.jsx';
import './App.scss';

@inject(allStores => ({
  store: allStores.store,
  layout: allStores.store.layout,
  config: allStores.config,
  api: allStores.api
}))
@observer
class App extends React.Component {
  static propTypes = {
    layout: PropTypes.observableObject.isRequired
  };

  componentWillMount() {
    if (!this.props.config.settings.showNewFeaturesDialogOnStart) {
      this.props.store.editorPanel.showNewFeaturesDialog = false;
    } else {
      this.props.store.editorPanel.showNewFeaturesDialog = true;
    }
  }

  componentDidMount() {
    const { store } = this.props;
    Broker.emit(EventType.APP_RENDERED);

    // Check if user has upgraded to new version for showing new features dialog.
    if (store.previousVersion) {
      if (store.previousVersion !== store.version) {
        // New version - Show new features.
        store.editorPanel.showNewFeaturesDialog = true;
        store.previousVersion = store.version;
      }
    } else {
      // If no version specified, this is first install - Show new Features.
      store.editorPanel.showNewFeaturesDialog = true;
      store.previousVersion = store.version;
    }
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
    this.props.config.patch({
      telemetryEnabled: bool
    });
    this.props.store.layout.optInVisible = false;
  }

  // eslint-disable-next-line camelcase
  unstable_handleError() {
    Broker.emit(EventType.APP_CRASHED);
  }

  render() {
    const { layout, store, api } = this.props;
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
        <TelemetryConsent />
        <PasswordDialog
          showDialog={this.props.store.password.showDialog}
          verifyPassword={this.props.store.password.verifyPassword}
        />
        <NewFeaturesDialog showDialog={this.props.store.editorPanel.showNewFeaturesDialog} />
        <PasswordResetDialog />
        <SplitPane
          className="RootSplitPane"
          split="vertical"
          defaultSize={60}
          minSize={60}
          maxSize={60}
        >
          <SideNav menuItems={[NavPanes.EDITOR, NavPanes.PROFILE]} />
          <div className="fullPanel">
            {store.drawer && store.drawer.activeNavPane == NavPanes.PROFILE && <ProfileManager />}
            {!store.drawer ||
              (store.drawer.activeNavPane == NavPanes.EDITOR && (
                <SplitPane
                  className="EditorSplitPane"
                  split="vertical"
                  defaultSize={defaultOverallSplitPos}
                  onDragFinished={this.updateOverallSplitPos}
                  minSize={350}
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
              ))}
          </div>
        </SplitPane>
        <StatusPanel className="statusPanel" />
        {store.performancePanel ? (
          <PerformancePanel
            performancePanel={store.performancePanel}
            onClose={() =>
              api.transformPerformancePanel(
                store.performancePanel.profileId,
                performancePanelStatuses.background
              )
            }
            resetHighWaterMark={() => api.resetHighWaterMark(store.performancePanel.profileId)}
            resetPerformancePanel={() => {
              api.resetPerformancePanel(store.performancePanel.profileId);
              console.log('!!!');
            }}
          />
        ) : null}
        {process.env.NODE_ENV !== 'production' ? (
          <div className="DevTools">
            <DevTools position={{ right: -1000, top: 200 }} />
          </div>
        ) : null}
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(App);
