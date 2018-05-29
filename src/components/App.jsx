/**
 * @Author: guiguan
 * @Date:   2017-03-07T13:47:00+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-29T23:47:40+10:00
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
import withDragDropContext from '#/hoc/withDragDropContext';
import { action, runInAction } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Position } from '@blueprintjs/core';
import DevTools from 'mobx-react-devtools';
import { DBKodaToaster } from '#/common/Toaster';
import { Analytics } from '#/Analytics';
import { StatusPanel } from '#/StatusBar';
import HomeEditor from '#/HomeEditor';
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
  config: allStores.config,
  api: allStores.api
}))
@observer
class App extends React.Component {
  componentWillMount() {
    runInAction(() => {
      if (!this.props.config.settings.showNewFeaturesDialogOnStart) {
        this.props.store.editorPanel.showNewFeaturesDialog = false;
      } else {
        this.props.store.editorPanel.showNewFeaturesDialog = true;
      }
    });
  }

  componentDidMount() {
    const { store } = this.props;
    Broker.emit(EventType.APP_RENDERED);

    // Check if user has upgraded to new version for showing new features dialog.
    runInAction(() => {
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
    });

    if (this.props.api && this.props.api.setToasterCallback) {
      this.props.api.setToasterCallback(this.showToaster);
    }
  }

  showToaster(strErrorCode, err) {
    switch (strErrorCode) {
      case 'existingAlias':
        DBKodaToaster(Position.LEFT_BOTTOM).show({
          message: globalString('connection/existingAlias'),
          className: 'danger',
          icon: 'thumbs-down'
        });
        break;
      case 'connectionFail':
        DBKodaToaster(Position.LEFT_BOTTOM).show({
          message: (
            <span
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: 'Error: ' + err.message.substring(0, 256) + '...'
              }}
            />
          ),
          className: 'danger',
          icon: 'thumbs-down'
        });
        break;
      case 'connectionSuccess':
        DBKodaToaster(Position.RIGHT_TOP).show({
          message: globalString('connection/success'),
          className: 'success',
          icon: 'thumbs-up'
        });
        break;
      default:
        break;
    }
  }

  @action.bound
  closeOptIn(bool) {
    this.props.config.patch({
      telemetryEnabled: bool
    });
    this.props.store.layout.optInVisible = false;
  }

  render() {
    const { store, api } = this.props;

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
        <div className="mainContainer">
          <SideNav menuItems={[NavPanes.EDITOR, NavPanes.PROFILE]} />
          <div className="fullPanel hasStatusbar">
            {store.drawer && store.drawer.activeNavPane == NavPanes.PROFILE && <ProfileManager />}
            {!store.drawer || (store.drawer.activeNavPane == NavPanes.EDITOR && <HomeEditor />)}
          </div>
        </div>
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
              l.info('!!!');
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

export default withDragDropContext(App);
